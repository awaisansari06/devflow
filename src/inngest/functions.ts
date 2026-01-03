import { Sandbox } from "@e2b/code-interpreter";

import { createAgent, openai } from '@inngest/agent-kit';

import { inngest } from "./client";

import { getSandboxUrl } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event , step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("devflow-project");
      return sandbox.sandboxId;
    });
    const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert nextjs developer. You write readable , maintainable code. You write simple Next.js & React Snippets.",
      model: openai({
        model: "llama-3.3-70b-versatile",
        baseUrl: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_API_KEY,
      }),
    });
    const { output } = await codeAgent.run(
      `Write the following snippet: ${event.data.value}`,
    );
    console.log(output);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandboxUrl(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return { output, sandboxUrl };
  },
);