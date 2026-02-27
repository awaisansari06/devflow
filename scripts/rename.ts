import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const res = await prisma.project.updateMany({
        where: { name: 'bad-mother' },
        data: { name: 'Netflix Clone' },
    })
    console.log(`Updated ${res.count} projects`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
