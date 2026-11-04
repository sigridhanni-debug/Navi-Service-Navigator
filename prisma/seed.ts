import { PrismaClient } from "@prisma/client";
import { seedServices } from "../src/lib/seed";

const prisma = new PrismaClient();

seedServices(prisma)
  .then((n) => console.log(`Seeded ${n} services`))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
