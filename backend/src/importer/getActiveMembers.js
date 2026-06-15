const prisma = require("../config/prisma");

async function getActiveMembers(groupId, expenseDate) {
  const members = await prisma.groupMember.findMany({
    where: {
      groupId
    }
  });

  return members.filter((member) => {
    const joined = member.joinedAt <= expenseDate;
    const notLeft = !member.leftAt || member.leftAt >= expenseDate;

    return joined && notLeft;
  });
}

module.exports = getActiveMembers;
