const express = require("express");
const prisma = require("../config/prisma");
const { calculateBalances } = require("../services/balanceService");

const router = express.Router();

router.get("/", async (req, res) => {
  if (!req.workspace) {
    return res.status(404).json({
      message: 'No workspace found for this user'
    });
  }

  const group = await prisma.group.findFirst({
    where: { workspaceId: req.workspace.id }
  });

  if (!group) {
    return res.status(404).json({
      message: 'No group found for this workspace'
    });
  }

  const balances = await calculateBalances(group.id, req.workspace.id);

  return res.json(balances);
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  const shares = await prisma.expenseShare.findMany({
    where: {
      userId
    },
    include: {
      expense: true
    }
  });

  const totalOwed = shares.reduce(
    (sum, share) => sum + share.shareAmount,
    0
  );

  return res.json({
    expenses: shares,
    totalOwed
  });
});

module.exports = router;
