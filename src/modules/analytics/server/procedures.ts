import { z } from "zod";
import { prisma } from "@/lib/db";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TEMPLATES } from "@/lib/templates";
import { subDays, format } from "date-fns";

export const analyticsRouter = createTRPCRouter({
    getStats: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.auth.userId as string;
        const now = new Date();
        const thirtyDaysAgo = subDays(now, 30);
        const sixtyDaysAgo = subDays(now, 60);

        // --- 1. Total Projects & Trend ---
        const totalProjects = await prisma.project.count({ where: { userId } });
        const projectsLast30Days = await prisma.project.count({
            where: { userId, createdAt: { gte: thirtyDaysAgo } },
        });
        const projectsPrev30Days = await prisma.project.count({
            where: { userId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        });

        // Calculate Trend percentage
        const calcTrend = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };
        const totalProjectsTrend = calcTrend(projectsLast30Days, projectsPrev30Days);

        // --- 2. Success Rate & Trend ---
        const allAssistantMessages = await prisma.message.findMany({
            where: { project: { userId }, role: "ASSISTANT", type: { in: ["RESULT", "ERROR"] } },
            select: { type: true, createdAt: true },
        });

        const totalGenerations = allAssistantMessages.length;
        const successfulGenerations = allAssistantMessages.filter((m) => m.type === "RESULT").length;
        const successRate = totalGenerations > 0 ? Math.round((successfulGenerations / totalGenerations) * 100) : 0;

        // Success Rate 30 days vs prev 30 days
        const genLast30 = allAssistantMessages.filter(m => m.createdAt >= thirtyDaysAgo);
        const genPrev30 = allAssistantMessages.filter(m => m.createdAt >= sixtyDaysAgo && m.createdAt < thirtyDaysAgo);

        const succLast30 = genLast30.filter(m => m.type === "RESULT").length;
        const rateLast30 = genLast30.length > 0 ? (succLast30 / genLast30.length) * 100 : 0;

        const succPrev30 = genPrev30.filter(m => m.type === "RESULT").length;
        const ratePrev30 = genPrev30.length > 0 ? (succPrev30 / genPrev30.length) * 100 : 0;

        const successRateTrend = Math.round(rateLast30 - ratePrev30); // Absolute percentage points difference

        // --- 3. Credits (Generations) Trend vs Last Month ---
        const totalGenerationsTrend = calcTrend(genLast30.length, genPrev30.length);

        // --- 4. Success vs Failure Over Time (Last 30 Days) ---
        const creditsOverTimeMap = new Map<string, { successful: number; failed: number }>();
        for (let i = 29; i >= 0; i--) {
            const dateStr = format(subDays(now, i), "MMM dd");
            creditsOverTimeMap.set(dateStr, { successful: 0, failed: 0 });
        }

        genLast30.forEach((msg) => {
            const dateStr = format(msg.createdAt, "MMM dd");
            if (creditsOverTimeMap.has(dateStr)) {
                const current = creditsOverTimeMap.get(dateStr)!;
                if (msg.type === "RESULT") current.successful += 1;
                else current.failed += 1;
            }
        });

        const creditsOverTime = Array.from(creditsOverTimeMap.entries()).map(([date, data]) => ({
            date,
            successful: data.successful,
            failed: data.failed,
        }));

        // --- 5. Templates & Category Usage ---
        const starterMessages = await prisma.message.findMany({
            where: { project: { userId }, role: "USER" },
            orderBy: { createdAt: "asc" },
            distinct: ["projectId"],
            select: { content: true },
        });

        const templateUsageMap = new Map<string, { count: number; name: string; id: string; category: string }>();
        const categoryUsageMap = new Map<string, number>();

        starterMessages.forEach((msg) => {
            const matchedTemplate = TEMPLATES.find((t) => msg.content === t.prompt);
            if (matchedTemplate) {
                // Track Template Use
                if (!templateUsageMap.has(matchedTemplate.id)) {
                    templateUsageMap.set(matchedTemplate.id, {
                        count: 0, name: matchedTemplate.name, id: matchedTemplate.id, category: matchedTemplate.category
                    });
                }
                templateUsageMap.get(matchedTemplate.id)!.count += 1;

                // Track Category Use
                categoryUsageMap.set(matchedTemplate.category, (categoryUsageMap.get(matchedTemplate.category) || 0) + 1);
            }
        });

        // Calculate Top Templates & their percentage of total template usage
        const totalTemplatesUsed = Array.from(templateUsageMap.values()).reduce((acc, curr) => acc + curr.count, 0);
        const mostUsedTemplates = Array.from(templateUsageMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 4)
            .map(t => ({
                ...t,
                percentage: totalTemplatesUsed > 0 ? Math.round((t.count / totalTemplatesUsed) * 100) : 0
            }));

        const usageByCategory = Array.from(categoryUsageMap.entries())
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);

        // --- 6. Recent Activity ---
        const recentProjects = await prisma.project.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                messages: {
                    orderBy: { createdAt: "asc" }
                }
            }
        });

        const recentActivity = recentProjects.map(p => {
            const firstMsg = p.messages.find(m => m.role === "USER");
            const matchedTemplate = firstMsg ? TEMPLATES.find(t => t.prompt === firstMsg.content) : null;

            // Check if there was any ERROR type message from ASSISTANT
            const hasError = p.messages.some(m => m.role === "ASSISTANT" && m.type === "ERROR");
            const hasResult = p.messages.some(m => m.role === "ASSISTANT" && m.type === "RESULT");

            let status = "Processing";
            if (hasError) status = "Failed";
            else if (hasResult) status = "Completed";

            return {
                id: p.id,
                name: p.name,
                templateName: matchedTemplate ? matchedTemplate.name : "Custom Prompt",
                createdAt: p.createdAt,
                status,
            };
        });

        return {
            totalProjects,
            totalProjectsTrend,
            totalGenerations, // For 30 day KPI
            totalGenerationsTrend, // For 30 day KPI trend
            successRate,
            successRateTrend,
            creditsOverTime,
            mostUsedTemplates,
            usageByCategory,
            recentActivity,
        };
    }),
});
