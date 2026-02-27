import { usageRouter } from '@/modules/usage/server/procedures';
import { createTRPCRouter } from '../init';
import { messageRouter } from '@/modules/messages/server/procedures';
import { projectsRouter } from '@/modules/projects/server/procedures';
import { analyticsRouter } from '@/modules/analytics/server/procedures';
import { fragmentsRouter } from '@/modules/fragments/server/procedures';

export const appRouter = createTRPCRouter({
  usage: usageRouter,
  messages: messageRouter,
  projects: projectsRouter,
  analytics: analyticsRouter,
  fragments: fragmentsRouter,
});

export type AppRouter = typeof appRouter;