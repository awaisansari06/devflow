
<div align="center">
  <a href="https://devflow-project.vercel.app">
    <img src="./public/logo.svg" alt="DevFlow Logo" width="120" />
  </a>

  # DevFlow
  
  **The Intelligent AI-Powered Coding Workspace**
  
  [![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://devflow-project.vercel.app/)
  [![Built with Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Powered by Gemini](https://img.shields.io/badge/Gemini-3%20PRO-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
  [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

  <p align="center">
    <a href="#-introduction">Introduction</a> •
    <a href="#-features">Features</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-database-schema">Database</a> •
    <a href="#-getting-started">Getting Started</a>
  </p>
</div>

---

## 📖 Introduction

**DevFlow** is not just another code editor; it is a **comprehensive, agentic coding environment** designed to bridge the gap between AI code generation and real-world execution. 

Traditional AI coding assistants gives you a snippet of code and leave you to figure out how to run it. **DevFlow changes the paradigm.** It acts as a full-fledged pair programmer that manages its own secure cloud computer (Sandbox), installs dependencies, runs commands, helps you debug errors, and renders instant UI previews.

Powered by **Google's Gemini-3-pro** model and orchestrated by **Inngest**, DevFlow can handle complex, multi-step tasks. Whether you need a React dashboard, a Python data script, or a Node.js utility, DevFlow writes it, runs it, and shows you the result live.

## ✨ Features

### 🤖 Autonomous AI Agent
At the heart of DevFlow is a sophisticated AI agent. It doesn't just "complete text"; it reasoning about your intent.
- **Planner**: Breaks down complex user requests into executable steps.
- **Executor**: Writes code to files, runs terminal commands, and manages file systems.
- **Debugger**: Reads error outputs from the terminal and auto-corrects its own code.

### 🔐 Secure Cloud Sandboxing
Safety is paramount. We don't run code on your browser or your local machine.
- **E2B Integration**: Every user session spins up a micro-VM (Sandbox) in the cloud.
- **Isolation**: Code execution is completely isolated from the host.
- **Persistence**: Files created in the sandbox can be retrieved and stored.

### 📝 Smart Fragments & UI Previews
Code is meant to be seen.
- **Fragments**: When the agent creates a UI component (like a React chart), DevFlow automatically wraps it in a "Fragment".
- **Live Rendering**: These fragments are rendered instantly in the chat interface using a specialized web-container approach.
- **Interactive**: You can interact with the generated UI components directly within the chat.

### ⚡ Real-Time Infrastructure
- **Streaming Responses**: responses are streamed token-by-token for immediate feedback.
- **Live State Sync**: Using TRPC and WebSockets/Polling to keep the UI in perfect sync with the agent's actions.

### 🛡️ Enterprise-Grade Security
- **Clerk Authentication**: Secure sign-up, login, and session management.
- **RBAC Ready**: Database schema designed for multi-user, multi-project isolation.

---

## 🏗️ Architecture

DevFlow follows a modern, event-driven architecture to handle long-running AI tasks without blocking the UI.

### 1. The Request Flow
1.  **User Input**: User sends a message via the frontend ID.
2.  **TRPC Mutation**: The frontend calls a TRPC procedure to save the message to the database.
3.  **Event Trigger**: The TRPC procedure triggers an **Inngest** event (`code-agent/run`).

### 2. The Agentic Loop (Server-Side)
The core logic lives in `src/inngest/functions.ts`.
1.  **Job Start**: Inngest picks up the event.
2.  **Context Loading**: Fetches conversation history from **Prisma** (PostgreSQL).
3.  **Sandbox Init**: Connects to an **E2B Sandbox**.
4.  **Reasoning**: Sends the context + user prompt to **Gemini-3-PRO**.
5.  **Tool Execution**:
    *   `write_file`: Gemini decides to write code.
    *   `run_command`: Gemini decides to install a package (`npm install`).
6.  **Loop**: The agent observes the output of the tools and decides the next step.
7.  **Final Response**: The agent generates a final summary and potentially a "Fragment" definition.

### 3. The Response Flow
1.  **State Update**: All intermediate steps and the final result are saved to the database.
2.  **UI Update**: The frontend (using TanStack Query) detects the new message and renders it.
3.  **Preview**: If a Fragment was created, the specific UI component is rendered in the `FragmentWeb` view.

---

## 🛠️ Tech Stack

### Core Frameworks
*   **[Next.js 15 (App Router)](https://nextjs.org/)**: The React framework for the web. Used for both frontend UI and API routes.
*   **[React 19](https://react.dev/)**: The library for web and native user interfaces.
*   **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid UI development.
*   **[Radix UI](https://www.radix-ui.com/)**: Unstyled, accessible components for building high-quality design systems.

### Backend & Infrastructure
*   **[tRPC](https://trpc.io/)**: End-to-end typesafe APIs. Connects our frontend and backend without schemas.
*   **[Inngest](https://www.inngest.com/)**: Reliability layer for serverless functions. Transforms our AI operations into durable, background workflows.
*   **[PostgreSQL](https://www.postgresql.org/)**: The World's Most Advanced Open Source Relational Database.
*   **[Prisma](https://www.prisma.io/)**: Next-generation Node.js and TypeScript ORM for interacting with the database.

### AI & Execution
*   **[Gemini](https://deepmind.google/technologies/gemini/)**: Google's latest high-performance multimodal model.
*   **[E2B](https://e2b.dev/)**: Secure code execution environments (sandboxes) for AI agents.
*   **[@inngest/agent-kit](https://github.com/inngest/agent-kit)**: Framework for building reliable AI agents.

### Tools & Utilities
*   **Clerk**: Complete user management and authentication.
*   **Lucide React**: Beautiful & consistent icons.
*   **Zod**: TypeScript-first schema declaration and validation.
*   **Sonner**: An opinionated toast component for React.

---

## 🚀 Getting Started

Follow these instructions to set up your local development environment.

### Prerequisites
*   **Node.js**: Version 18 or higher.
*   **Package Manager**: `npm`, `pnpm`, or `yarn`.
*   **PostgreSQL**: A local or cloud instance (e.g., Neon, Supabase).

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/devflow.git
cd devflow
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Setup
Duplicate the `.env.example` file to `.env` and fill in the secrets.

| Variable | Description | Where to get it |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL Connection String | Your DB provider (Neon/Supabase/Local) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Public Key | Clerk Dashboard |
| `CLERK_SECRET_KEY` | Clerk Secret Key | Clerk Dashboard |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API Key | Google AI Studio |
| `E2B_API_KEY` | E2B Access Token | E2B Dashboard |
| `INNGEST_EVENT_KEY` | Inngest Event Key | Inngest (Local Dev) |
| `INNGEST_SIGNING_KEY` | Inngest Signing Key | Inngest (Local Dev) |

### Step 4: Database Migration
Push the Prisma schema to your database to create the tables.
```bash
npx prisma generate
npx prisma db push
```

### Step 5: Start the Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### Step 6: Start the Inngest Dev Server (Optional but Recommended)
To visualize and debug the AI agent workflows:
```bash
npx inngest-cli@latest dev
```
Open `http://localhost:8288` to see the Inngest dashboard.

---

## 📂 Project Structure

```
a:\devflow\
├── .next/                   # Next.js build output
├── node_modules/            # Dependencies
├── prisma/                  # Database configuration
│   └── schema.prisma        # The source of truth for our data model
├── public/                  # Static assets (images, fonts)
├── src/
│   ├── app/                 # Next.js 15 App Router
│   │   ├── (auth)/          # Authentication routes (sign-in/up)
│   │   ├── api/             # API handlers (TRPC, Inngest, Clerk)
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Landing page
│   ├── components/          # Reusable UI components
│   │   └── ui/              # Radix + Tailwind primitives (buttons, inputs)
│   ├── inngest/             # Background logic
│   │   ├── client.ts        # Inngest client initialization
│   │   ├── functions.ts     # The AI Agent implementation
│   │   └── utils.ts         # Agent utilities
│   ├── lib/                 # Shared libraries
│   │   ├── db.ts            # Global Prisma client
│   │   └── utils.ts         # CSS class merger
│   ├── modules/             # Domain-specific modules
│   │   └── projects/        # Project management logic & UI
│   ├── trpc/                # TRPC setup
│   │   ├── init.ts          # TRPC initialization
│   │   ├── routers/         # API routers
│   │   └── server.ts        # Server-side caller
│   ├── middleware.ts        # Clerk auth middleware
│   └── types.ts             # Global TypeScript types
├── .env                     # Environment variables
├── .gitignore               # Git ignore rules
├── components.json          # shadcn/ui configuration
├── next.config.mjs          # Next.js configuration
├── package.json             # Project metadata & scripts
├── postcss.config.mjs       # PostCSS config
├── tailwind.config.ts       # Tailwind CSS config
└── tsconfig.json            # TypeScript config
```

---

## 🤝 Contributing

We welcome contributions from the community!

1.  **Fork the Project**: Create your own copy of the repository.
2.  **Create a Branch**: `git checkout -b feature/AmazingFeature`
3.  **Commit Changes**: `git commit -m 'Add some AmazingFeature'`
4.  **Push to Branch**: `git push origin feature/AmazingFeature`
5.  **Open a Pull Request**: We'll review your code and merge it if it aligns with the project vision.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <br />
  <p>Made with ❤️ by <b>Awais Ansari</b></p>
  <p><i>Building the future of coding, one prompt at a time.</i></p>
</div>
