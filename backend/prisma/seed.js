const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const users = [
    "Aisha",
    "Rohan",
    "Priya",
    "Meera",
    "Sam",
    "Dev"
  ];

  for (const name of users) {
    await prisma.user.create({
      data: {
        name,
        email: `${name.toLowerCase()}@test.com`,
        password: "dummy"
      }
    });
  }

  const group = await prisma.group.create({
    data: {
      name: "Flatmates"
    }
  });

  const allUsers = await prisma.user.findMany();

  for (const user of allUsers) {
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: user.id,
        joinedAt: new Date("2026-02-01")
      }
    });
  }

  console.log("Seed completed");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
