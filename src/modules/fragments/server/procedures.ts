import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { getSandbox } from "@/inngest/utils";
import { logger } from "@/lib/logger";

const MAX_FRAGMENT_JSON_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function extractSandboxId(sandboxUrl: string): string | null {
    try {
        const parsed = new URL(sandboxUrl);
        const match = parsed.hostname.match(/^(?:3000-)?([a-zA-Z0-9_-]+)\.e2b\.(?:app|dev)$/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

export const fragmentsRouter = createTRPCRouter({
    /**
     * Update files in a fragment.
     * Accepts an array of text-replacement patches and applies them
     * to the stored fragment files JSON and syncs them to the E2B sandbox.
     */
    updateFiles: protectedProcedure
        .input(
            z.object({
                fragmentId: z.string().min(1),
                patches: z
                    .array(
                        z.object({
                            filePath: z
                                .string()
                                .min(1)
                                .max(500)
                                .refine((p) => !p.includes("..") && !p.startsWith("/"), {
                                    message: "Invalid file path",
                                }),
                            oldContent: z.string().max(100000),
                            newContent: z.string().max(100000),
                        })
                    )
                    .min(1, { message: "At least one patch is required" })
                    .max(50, { message: "Maximum 50 patches allowed per update" }),
            })
        )
        .mutation(async ({ input, ctx }) => {
            // Fetch fragment with ownership validation
            const fragment = await prisma.fragment.findUnique({
                where: { id: input.fragmentId },
                include: {
                    message: {
                        include: {
                            project: true,
                        },
                    },
                },
            });

            if (!fragment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Fragment not found",
                });
            }

            if (fragment.message.project.userId !== ctx.auth.userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You do not own this project",
                });
            }

            // Apply patches to the files
            const files = (fragment.files || {}) as Record<string, string>;
            const updatedFiles = { ...files };
            const touchedFiles = new Set<string>();

            for (const patch of input.patches) {
                const targetKey = Object.keys(updatedFiles).find(
                    (k) => k === patch.filePath || k.replace(/^\/+/, "") === patch.filePath.replace(/^\/+/, "")
                ) || patch.filePath;

                if (updatedFiles[targetKey]) {
                    updatedFiles[targetKey] = updatedFiles[targetKey].replace(
                        patch.oldContent,
                        patch.newContent
                    );
                    touchedFiles.add(targetKey);
                }
            }

            // Guard against unbounded database bloat
            const payloadSizeBytes = Buffer.byteLength(JSON.stringify(updatedFiles), "utf8");
            if (payloadSizeBytes > MAX_FRAGMENT_JSON_SIZE_BYTES) {
                throw new TRPCError({
                    code: "PAYLOAD_TOO_LARGE",
                    message: `Fragment files total size (${Math.round(payloadSizeBytes / 1024)} KB) exceeds 5 MB limit`,
                });
            }

            // Update the fragment in the database
            const updated = await prisma.fragment.update({
                where: { id: input.fragmentId },
                data: {
                    files: updatedFiles,
                },
            });

            // If the fragment has an active E2B sandbox, sync the modified files directly to disk
            if (fragment.sandboxUrl && process.env.E2B_API_KEY) {
                const sandboxId = extractSandboxId(fragment.sandboxUrl);
                if (sandboxId) {
                    try {
                        const sandbox = await getSandbox(sandboxId);
                        for (const filePath of touchedFiles) {
                            const newContent = updatedFiles[filePath];
                            if (typeof newContent === "string") {
                                const relPath = filePath.replace(/^\/+/, "");
                                await sandbox.files.write(relPath, newContent);
                            }
                        }
                        logger.info("[fragments.updateFiles] Synced modified files to E2B sandbox", {
                            sandboxId,
                            fileCount: touchedFiles.size,
                        });
                    } catch (sandboxErr) {
                        logger.warn(
                            "[fragments.updateFiles] Could not sync changes to sandbox (it may be paused/stopped)",
                            { error: sandboxErr instanceof Error ? sandboxErr.message : String(sandboxErr) }
                        );
                    }
                }
            }

            return updated;
        }),
});
