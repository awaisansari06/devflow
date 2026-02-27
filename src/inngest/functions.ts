import { z } from "zod";
import { Sandbox } from "@e2b/code-interpreter";
import { createAgent, gemini, createTool, createNetwork, Tool, createState, Message } from '@inngest/agent-kit';
import { PROMPT } from "../prompt";
import { prisma } from "@/lib/db";
import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessageContent, parseAgentOutput } from "./utils";

// Default: 15 minutes. Override via E2B_SANDBOX_TIMEOUT_MS env var.
const SANDBOX_TIMEOUT_MS = Number(process.env.E2B_SANDBOX_TIMEOUT_MS) || 60_000 * 15;

const FragmentFilesSchema = z.record(z.string(), z.string());


interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent", retries: 3 },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    let sandboxId: string | undefined;
    let generationFailed = false;
    try {
      await step.run("log-create-sandbox", async () => {
        await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Creating sandbox...",
            role: "ASSISTANT",
            type: "LOG",
          },
        });
      });

      sandboxId = await step.run("get-sandbox-id", async () => {
        const sandbox = await Sandbox.create("devflow-project");
        await sandbox.setTimeout(SANDBOX_TIMEOUT_MS);
        return sandbox.sandboxId;
      });

      const previousMessages = await step.run("get-previous-messages", async () => {
        const formattedMessages: Message[] = [];

        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: "asc", // Changed to "asc" to provide chronological order
          },
          take: 5,
        });

        for (const message of messages) {
          formattedMessages.push({
            type: "text",
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
          })
        }

        return formattedMessages;
      });

      const state = createState<AgentState>(
        {
          summary: "",
          files: {},
        },
        {
          messages: previousMessages,
        }
      )

      const codeAgent = createAgent<AgentState>({
        name: "code-agent",
        system: PROMPT,
        description: "An expert coding agent",
        model: gemini({
          model: "gemini-3-flash-preview"
        }),
        tools: [
          createTool({
            name: "terminal",
            description: "Use the terminal to run commands",
            parameters: z.object({
              command: z.string(),
            }),
            handler: async ({ command }, { step }) => {
              await step?.run("log-terminal", async () => {
                const actionDesc = command.startsWith("npm") || command.startsWith("pnpm") || command.startsWith("yarn")
                  ? `Installing dependencies: ${command}`
                  : `Running command: ${command}`;

                await prisma.message.create({
                  data: {
                    projectId: event.data.projectId,
                    content: actionDesc,
                    role: "ASSISTANT",
                    type: "LOG",
                  },
                });
              });

              return await step?.run("terminal", async () => {
                const buffers = { stdout: "", stderr: "" };

                try {
                  const sandbox = await getSandbox(sandboxId!);
                  const result = await sandbox.commands.run(command, {
                    onStdout: (data: string) => {
                      buffers.stdout += data;
                    },
                    onStderr: (data: string) => {
                      buffers.stderr += data;
                    }
                  });
                  return result.stdout;

                } catch (e) {
                  console.error(
                    `Command failed:${e} \nStdout: ${buffers.stdout} \nStderr: ${buffers.stderr}`
                  );
                  return `Command failed:${e} \nStdout: ${buffers.stdout} \nStderr: ${buffers.stderr}`;
                }
              });
            },
          }),
          createTool({
            name: "createOrUpdateFiles",
            description: "Create or update files in the sandbox",
            parameters: z.object({
              files: z.array(
                z.object({
                  path: z.string(),
                  content: z.string(),
                }),
              )
            }),
            handler: async (
              { files },
              { step, network }: Tool.Options<AgentState>
            ) => {
              await step?.run("log-create-files", async () => {
                const fileNames = files.map(f => f.path.split('/').pop()).join(', ');
                const content = files.length === 1
                  ? `Writing ${fileNames}...`
                  : `Writing ${files.length} files (${fileNames})...`;

                await prisma.message.create({
                  data: {
                    projectId: event.data.projectId,
                    content: content,
                    role: "ASSISTANT",
                    type: "LOG",
                  },
                });
              });

              const newFiles = await step?.run("createOrUpdateFiles", async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId!);
                  for (const file of files) {
                    let sanitizedContent = file.content;
                    // If the file content lacks actual newlines but contains literal "\n",
                    // the LLM likely double-escaped the JSON payload. Unescape it.
                    if (!sanitizedContent.includes('\n') && sanitizedContent.includes('\\n')) {
                      sanitizedContent = sanitizedContent.replace(/\\n/g, '\n');
                    }
                    await sandbox.files.write(file.path, sanitizedContent);
                    updatedFiles[file.path] = sanitizedContent;
                  }
                  return updatedFiles;
                } catch (e) {
                  return "Error: " + e;
                }
              });

              if (typeof newFiles === "object") {
                network.state.data.files = newFiles;
              }
            }
          }),
          createTool({
            name: "readFiles",
            description: "Read files from the sandbox",
            parameters: z.object({
              files: z.array(z.string()),
            }),
            handler: async ({ files }, { step }) => {
              await step?.run("log-read-files", async () => {
                const fileNames = files.map(f => f.split('/').pop()).join(', ');
                const content = files.length === 1
                  ? `Reading ${fileNames}...`
                  : `Reading ${files.length} files (${fileNames})...`;

                await prisma.message.create({
                  data: {
                    projectId: event.data.projectId,
                    content: content,
                    role: "ASSISTANT",
                    type: "LOG",
                  },
                });
              });

              return await step?.run("readFiles", async () => {
                try {
                  const sandbox = await getSandbox(sandboxId!);
                  const contents = [];
                  for (const file of files) {
                    const content = await sandbox.files.read(file);
                    contents.push({
                      path: file,
                      content
                    });
                  }
                  return JSON.stringify(contents);
                } catch (e) {
                  return "Error: " + e;
                }
              });
            },
          }),
        ],
        lifecycle: {
          onResponse: async ({ result, network }) => {
            const lastAssistantMessageText =
              lastAssistantTextMessageContent(result);

            if (lastAssistantMessageText && network) {
              if (lastAssistantMessageText.includes("<task_summary>")) {
                network.state.data.summary = lastAssistantMessageText;
              }
            }
            return result;
          },
        }
      });

      const network = createNetwork<AgentState>({
        name: "coding-agent-network",
        agents: [codeAgent],
        maxIter: 15,
        defaultState: state,
        router: async ({ network }) => {
          const summary = network.state.data.summary;

          if (summary) {
            return;
          }

          return codeAgent;
        },
      });


      let result;
      try {
        result = await network.run(event.data.value, { state });
      } catch (networkError: any) {
        console.error("Agent network error:", networkError);

        await step.run("log-network-error", async () => {
          await prisma.message.create({
            data: {
              projectId: event.data.projectId,
              content: `Agent paused due to a network or rate limit error: ${networkError.message || networkError}. Saved partial progress.`,
              role: "ASSISTANT",
              type: "LOG",
            },
          });
        });

        // Recover state to save partial files
        result = { state };
      }

      const outputOptimizer = createAgent({
        name: "output-optimizer",
        system: `Based on the <task_summary>, generate a JSON response with two fields.\n"title": A short, descriptive title (Max 3 words, Title Case, no punctuation).\n"response": A short, user-friendly message (1-3 sentences) explaining what was built.`,
        description: "An output optimizer that generates both the fragment title and response",
        model: gemini({
          model: "gemini-2.0-flash"
        }),
      });

      let fragmentTitleOutput = "Partial Workspace";
      let responseOutput = "The agent encountered an error mid-generation and stopped. However, the files generated up to that point have been saved below.";

      if (result.state.data.summary) {
        const optimized = await outputOptimizer.run(result.state.data.summary);
        try {
          // Parse string since model might return markdown formatted JSON
          let cleanedOut = parseAgentOutput(optimized.output);
          if (cleanedOut.startsWith("\`\`\`json")) {
            cleanedOut = cleanedOut.replace("\`\`\`json", "").replace("\`\`\`", "");
          }
          const parsed = JSON.parse(cleanedOut) as any;

          if (parsed.title) fragmentTitleOutput = parsed.title;
          if (parsed.response) responseOutput = parsed.response;
        } catch (e) {
          console.error("Failed to parse output-optimizer JSON:", e);
        }
      }

      const isError =
        !result.state.data.summary &&
        Object.keys(result.state.data.files || {}).length === 0;

      const sandboxUrl = await step.run("get-sandbox-url", async () => {
        const sandbox = await getSandbox(sandboxId!);
        const host = sandbox.getHost(3000);
        return `https://${host}`;
      });

      await step.run("save-result", async () => {
        if (isError) {
          return await prisma.message.create({
            data: {
              projectId: event.data.projectId,
              content: "Something went wrong. Please try again.",
              role: "ASSISTANT",
              type: "ERROR",
            },
          });
        }
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: responseOutput,
            role: "ASSISTANT",
            type: "RESULT",
            fragment: {
              create: {
                sandboxUrl: sandboxUrl,
                title: fragmentTitleOutput,
                files: FragmentFilesSchema.parse(result.state.data.files || {}) as any,
              },
            },
          },
        });
      });

      return {
        url: sandboxUrl,
        title: "Fragment",
        files: result.state.data.files,
        summary: result.state.data.summary,
      };
    } catch (error) {
      console.error("Inngest agent error:", error);
      generationFailed = true;
      await step.run("report-failure", async () => {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "The agent encountered an unexpected error. This often happens due to API limits or invalid configurations. Please try again with a different prompt.",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      });
      // Rethrow to let Inngest handle retries if configured
      throw error;
    } finally {
      await step.run("close-sandbox", async () => {
        try {
          if (sandboxId && generationFailed) {
            const sandbox = await getSandbox(sandboxId);
            await sandbox.kill();
          }
        } catch (e) {
          console.error("Failed to close sandbox gracefully:", e);
        }
      });
    }
  },
);