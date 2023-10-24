const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  async create(tg_id, tg_username, tg_first_name, tg_last_name) {
    return await prisma.users.create({
      data: {
        tg_id: tg_id,
        tg_username: tg_username,
        tg_first_name: tg_first_name,
        tg_last_name: tg_last_name,
      },
    });
  },
  async delete(tg_id) {
    return await prisma.users.delete({
      where: {
        tg_id: tg_id,
      },
    });
  },
  async stats() {
    return await prisma.users.count();
  },
  async getOne(tg_id) {
    return await prisma.users.findUnique({
      where: {
        tg_id: tg_id,
      },
    });
  },
  async getAll() {
    return await prisma.users.findMany();
  },
  async getByGroup(value) {
    return await prisma.users.findMany({
      where: {
        group: value,
      },
    });
  },
  async setGroup(tg_id, group) {
    return await prisma.users.update({
      where: {
        tg_id,
      },
      data: {
        group,
      },
    });
  },
};
