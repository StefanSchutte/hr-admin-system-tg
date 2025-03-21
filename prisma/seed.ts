import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

/** Prisma client instance for database operations */
const prisma = new PrismaClient();

/**
 * Seed function that initializes the database with required data.
 * 1. Creates a hashed password for the admin user.
 * 2. Upserts the admin user (creates if doesn't exist, leaves unchanged if exists).
 * @returns {Promise<void>}
 */
async function main() {

    const hashedPassword = await bcrypt.hash("TestPass1234", 10);

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

/**
 * Script execution with error handling.
 * Runs the main seed function and handles cleanup:
 * - Disconnects from the database on success.
 * - Logs errors, disconnects, and exits with error code on failure.
 */
main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });