import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";

export const fragmentsRouter = createTRPCRouter({
    /**
     * Update files in a fragment.
     * Accepts an array of text-replacement patches and applies them
     * to the stored fragment files JSON.
     */
    updateFiles: protectedProcedure
        .input(
            z.object({
                fragmentId: z.string().min(1),
                patches: z.array(
                    z.object({
                        filePath: z.string(),
                        oldContent: z.string(),
                        newContent: z.string(),
                    })
                ),
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

            for (const patch of input.patches) {
                if (updatedFiles[patch.filePath]) {
                    updatedFiles[patch.filePath] = updatedFiles[patch.filePath].replace(
                        patch.oldContent,
                        patch.newContent
                    );
                }
            }

            // Update the fragment in the database
            const updated = await prisma.fragment.update({
                where: { id: input.fragmentId },
                data: {
                    files: updatedFiles,
                },
            });

            return updated;
        }),
});
