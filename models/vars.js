const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  async set(key, value) {
    return await prisma.vars.update({
      data: {
        value: value,
      },
      where: {
        key: key,
      },
    });
  },
  async get(key) {
    return await prisma.vars.findUnique({
      where: {
        key: key,
      },
    });
  },
};
