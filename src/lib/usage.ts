import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { RateLimiterPrisma } from "rate-limiter-flexible";
import { prisma } from "./db";

const FREE_POINTS = 2;
const PRO_POINTS = 100;
const DURATION = 30 * 24 * 60 * 60; // 30 days
const GENERATION_COST = 1;

// Cache Pro access lookup per request lifecycle
const checkProAccess = cache(async () => {
    const { has } = await auth();
    return has({ plan: "pro" });
});

export async function getUsageTracker() {
    const hasProAccess = await checkProAccess();

    const usageTracker = new RateLimiterPrisma({
        storeClient: prisma,
        tableName: "usage",
        points: hasProAccess ? PRO_POINTS : FREE_POINTS,
        duration: DURATION,
    });

    return usageTracker;
};

export async function consumeCredits() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }

    const usageTracker = await getUsageTracker();
    const result = await usageTracker.consume(userId, GENERATION_COST);
    return result;
}

export async function refundCredits(targetUserId?: string) {
    try {
        let userId = targetUserId;
        if (!userId) {
            const authObj = await auth();
            userId = authObj.userId ?? undefined;
        }

        if (!userId) return;

        const usageTracker = await getUsageTracker();
        await usageTracker.reward(userId, GENERATION_COST);
    } catch (error) {
        console.error("Failed to refund credits:", error);
    }
}

export async function getUsageStatus() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }

    const usageTracker = await getUsageTracker();
    const result = await usageTracker.get(userId);
    return result;
};