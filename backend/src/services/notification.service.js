const prisma = require("../config/prisma");

async function createNotification(icon, text, userId) {
  try {
    return await prisma.notification.create({
      data: { icon, text, userId }
    });
  } catch (err) {
    console.error("Error creating notification:", err);
  }
}

module.exports = { createNotification };
