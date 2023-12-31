import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "@prisma/client/edge";

import { env } from "~/env";

function get_client() {
    return new PrismaClient({
        log:
            env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
    }).$extends(withAccelerate());
}

type PrismaClientType = ReturnType<typeof get_client>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientType | undefined;
};

export const db = globalForPrisma.prisma ?? get_client();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
