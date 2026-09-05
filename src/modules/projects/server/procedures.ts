import { z } from "zod";
import { prisma } from "@/lib/db";
import { consumeCredits, refundCredits } from "@/lib/usage";
import { TRPCError } from "@trpc/server";
import { inngest } from "@/inngest/client";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { AI_MODELS } from "@/config/ai-models";

async function generateTitle(prompt: string) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.TITLE_AGENT}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `Generate a short, 3-5 word title for a project based on this prompt. Return ONLY the title, no quotes or extra text.\n\nPrompt: ${prompt.substring(0, 500)}` }] }]
      })
    });
    const data = await res.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim().replace(/^["']|["']$/g, '');
    }
  } catch (error) {
    console.error("Title generation failed:", error);
  }
  return prompt.split("\n")[0].substring(0, 50) || "Untitled Project";
}

export const projectsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "ID is required" }),
      })
    )
    .query(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return existingProject;
    }),
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const projects = await prisma.project.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        updatedAt: "desc"
      },
    });
    return projects;
  }),
  create: protectedProcedure
    .input(
      z.object({
        value: z.string()
          .min(1, { message: "Value is required" })
          .max(10000, { message: "Value is too long" })

      }),
    )
    .mutation(async ({ input, ctx }) => {

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

      try {
        const generatedName = await generateTitle(input.value);

        const createdProject = await prisma.project.create({
          data: {
            userId: ctx.auth.userId,
            name: generatedName,
            messages: {
              create: {
                content: input.value,
                role: "USER",
                type: "RESULT",
              },
            },
          },
        });

        await inngest.send({
          name: "code-agent/run",
          data: {
            value: input.value,
            projectId: createdProject.id,
          }
        });

        return createdProject;
      } catch (err) {
        await refundCredits(ctx.auth.userId);
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to initialize project",
          cause: err,
        });
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "ID is required" }),
        name: z.string().min(1, { message: "Name is required" }).max(100, { message: "Name is too long" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const updatedProject = await prisma.project.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });

      return updatedProject;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "ID is required" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      await prisma.project.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),
  toggleFavorite: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "ID is required" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const updatedProject = await prisma.project.update({
        where: {
          id: input.id,
        },
        data: {
          isFavorite: !existingProject.isFavorite,
        },
      });

      return updatedProject;
    }),
});

