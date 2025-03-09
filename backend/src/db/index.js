// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// const connectDB = async () => {
//     try {
//         await prisma.$connect();
//         console.log("Database connected successfully");
//     } catch (error) {
//         console.log("Database connected successfully");
//         process.exit(1);
//     }
// }

// export { prisma, connectDB };

import { PrismaClient } from "@prisma/client";

let prisma;

if (!global.__prisma) {
    global.__prisma = new PrismaClient();
}
prisma = global.__prisma;

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed", error);
        process.exit(1);
    }
};

export { prisma, connectDB };
