import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    // Hash the password
    const hashedPassword = await bcrypt.hash("TestPass1234", 10);

    // Create the admin user
    const adminUser = await prisma.user.upsert({
        where: { email: "hradmin@test.com" },
        update: {},
        create: {
            email: "hradmin@test.com",
            name: "HR Administrator",
            password: hashedPassword,
            role: "ADMIN",
        },
    });

    console.log(`Admin user created/updated: ${adminUser.email}`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });