import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
    adapter,
});

const projectData: Prisma.ProjectCreateInput[] = [
    {
        userId: "user_seed_test", // Placeholder user ID
        name: "Demo Project",
        messages: {
            create: [
                {
                    content: "Hello world",
                    role: "USER",
                    type: "RESULT"
                }
            ]
        }
    }
];

export async function main() {
    for (const p of projectData) {
        await prisma.project.create({ data: p });
    }
}

main();