const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  async set(value) {
    return await prisma.timetable.create({
      data: {
        table: value,
      },
    });
  },
  async getLast() {
    return await prisma.timetable.findFirst({
      orderBy: {
        date: "desc",
      },
    });
  },
};
