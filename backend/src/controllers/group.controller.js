const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMembers = async (req, res) => {
  try {
    let { groupId } = req.params;

    // MVP workaround: map 'default' to the actual first group the user owns
    if (groupId === "default") {
      if (!req.workspace) {
        return res.json([]);
      }
      const firstGroup = await prisma.group.findFirst({
        where: { workspaceId: req.workspace.id }
      });
      if (!firstGroup) {
        return res.json([]);
      }
      groupId = firstGroup.id;
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: true
      }
    });

    res.json(members);
  } catch (error) {
    console.error("Error fetching group members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getMembers
};
