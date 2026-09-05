/**
 * AI Model Configurations
 *
 * App building uses gemini-3.8-flash.
 * All auxiliary agents (summaries, titles, explanations) use gemini-3.5-flash-lite.
 */

export const AI_MODELS = {
    /** Primary coding agent in Inngest for building the application */
    CODE_AGENT: process.env.CODE_AGENT_MODEL || "gemini-3.5-flash-lite",

    /** Output optimizer for fragment title & response generation */
    OUTPUT_OPTIMIZER: process.env.OPTIMIZER_MODEL || "gemini-3.5-flash-lite",

    /** Project title generator */
    TITLE_AGENT: process.env.TITLE_MODEL || "gemini-3.5-flash-lite",

    /** Code explanation API route agent */
    EXPLAINER: process.env.EXPLAINER_MODEL || "gemini-3.5-flash-lite",
} as const;
