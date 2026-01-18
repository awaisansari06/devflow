import { usageRouter } from '@/modules/usage/server/procedures';
import { createTRPCRouter } from '../init';
import { messageRouter } from '@/modules/messages/server/procedures';
import { projectsRouter } from '@/modules/projects/server/procedures';

export const appRouter = createTRPCRouter({
  usage: usageRouter,
  messages: messageRouter,
  projects: projectsRouter,
});

export type AppRouter = typeof appRouter;