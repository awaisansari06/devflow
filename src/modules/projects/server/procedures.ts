import { z } from "zod";
import { generateSlug } from "random-word-slugs";
import { prisma } from "@/lib/db";
import { consumeCredits } from "@/lib/usage";
import { TRPCError } from "@trpc/server";
import { inngest } from "@/inngest/client";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";



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
          userId: ctx.auth.userId as string,
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
        userId: ctx.auth.userId as string,
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

      const createdProject = await prisma.project.create({
        data: {
          userId: ctx.auth.userId as string,
          name: generateSlug(2, {
            format: "kebab",
          }),
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
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "ID is required" }),
        name: z.string().min(1, { message: "Name is required" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId as string,
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
          userId: ctx.auth.userId as string,
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
      console.log("TOGGLE FAVORITE CALLED");
      console.log("Input ID:", input.id);
      console.log("User ID:", ctx.auth.userId);

      const existingProject = await prisma.project.findFirst({
        where: {
          id: input.id,
          userId: ctx.auth.userId as string,
        },
      });

      console.log("Existing Project Found:", !!existingProject);

      if (!existingProject) {
        console.log("ERROR: Project not found for user");
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

      console.log("Updated Project Favorite Status:", updatedProject.isFavorite);

      return updatedProject;
    }),
});

