import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { inngest } from "@/inngest/client";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { consumeCredits, refundCredits } from "@/lib/usage";

export const messageRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: "Project ID is required" }),

      }),
    )
    .query(async ({ input, ctx }) => {
      const messages = await prisma.message.findMany({
        where: {
          projectId: input.projectId,
          project: {
            userId: ctx.auth.userId,
          },
        },
        include: {
          fragment: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      return messages;
    }),
  createMessage: protectedProcedure
    .input(
      z.object({
        value: z.string()
          .min(1, { message: "Value is required" })
          .max(10000, { message: "Value is too long" }),
        projectId: z.string().min(1, { message: "Project ID is required" }),
        isAutoFix: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.auth.userId,
        },
      })

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      let shouldConsumeCredits = true;

      // If it's an auto-fix, verify that the last assistant message was an ERROR
      if (input.isAutoFix) {
        const lastAssistantMessage = await prisma.message.findFirst({
          where: {
            projectId: existingProject.id,
            role: "ASSISTANT",
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        if (lastAssistantMessage?.type === "ERROR") {
          shouldConsumeCredits = false;
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot auto-fix: the last message was not an error.",
          });
        }
      }

      if (shouldConsumeCredits) {
        try {
          await consumeCredits();
        } catch (error) {
          if (error instanceof Error) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Something went wrong",
            });
          } else {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: "You have reached your limit of free credits",
            });
          }
        }
      }

      try {
        const createdMessage = await prisma.message.create({
          data: {
            projectId: existingProject.id,
            content: input.value,
            role: "USER",
            type: "RESULT",
          },
        });

        await inngest.send({
          name: "code-agent/run",
          data: {
            value: input.value,
            projectId: input.projectId,
          }
        });

        return createdMessage;
      } catch (err) {
        if (shouldConsumeCredits) {
          await refundCredits(ctx.auth.userId);
        }
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to dispatch message generation",
          cause: err,
        });
      }
    }),
});
