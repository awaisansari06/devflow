
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Prisma Client...");

    // Create a dummy project if none exists (or find first)
    let project = await prisma.project.findFirst();

    if (!project) {
        console.log("No projects found, creating one...");
        project = await prisma.project.create({
            data: {
                name: "Debug Project",
                userId: "debug-user",
                isFavorite: false
            }
        });
    }

    console.log("Project found:", project.id);
    console.log("Current isFavorite:", project.isFavorite);

    // Toggle it
    const updated = await prisma.project.update({
        where: { id: project.id },
        data: { isFavorite: !project.isFavorite }
    });

    console.log("Updated isFavorite:", updated.isFavorite);

    if (updated.isFavorite === project.isFavorite) {
        console.error("ERROR: Update failed to change value!");
    } else {
        console.log("SUCCESS: Value toggled correctly in DB.");
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
