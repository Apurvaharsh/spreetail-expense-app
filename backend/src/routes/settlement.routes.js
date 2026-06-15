const express = require("express");
const prisma = require("../config/prisma");
const { calculateBalances } = require("../services/balanceService");
const simplifyDebts = require("../services/settlementService");
const { createNotification } = require("../services/notification.service");

const router = express.Router();

router.get("/", async (req, res) => {
  const status = req.query.status;
  
  if (!req.workspace) return res.status(404).json({ message: 'No workspace found' });

  const group = await prisma.group.findFirst({
    where: { workspaceId: req.workspace.id }
  });

  if (!group) return res.status(404).json({ message: 'Group not found' });

  if (status === "SETTLED") {
    // This is essentially the history endpoint
    const payments = await prisma.payment.findMany({
      where: { workspaceId: req.workspace.id },
      include: {
        fromUser: true,
        toUser: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(payments.map(p => ({
      id: p.id,
      fromId: p.fromUserId,
      from: p.fromUser.name,
      toId: p.toUserId,
      to: p.toUser.name,
      amount: p.amount,
      status: "SETTLED",
      settledAt: p.createdAt
    })));
  }

  // Default to PENDING
  const balances = await calculateBalances(group.id, req.workspace.id);
  const settlements = simplifyDebts(balances);

  return res.json({
    data: settlements.map(s => ({...s, status: "PENDING"})),
    meta: {
      rawTransactions: balances.filter(b => b.balance !== 0).length, // simple proxy for raw
      simplifiedTransactions: settlements.length
    }
  });
});

router.get("/summary", async (req, res) => {
  if (!req.workspace) return res.status(404).json({ message: 'No workspace found' });

  const group = await prisma.group.findFirst({
    where: { workspaceId: req.workspace.id }
  });
  
  if (!group) return res.status(404).json({ message: 'Group not found' });

  const balances = await calculateBalances(group.id, req.workspace.id);
  const pendingSettlements = simplifyDebts(balances);
  const settledCount = await prisma.payment.count({ where: { workspaceId: req.workspace.id } });

  // Count raw non-zero balances
  let rawTransactions = 0;
  for (const b of balances) {
    if (b.balance < 0) rawTransactions++;
  }
  // This is an approximation. Splitwise's "raw" transactions is usually N*(N-1)/2 or similar.
  // Actually, we can count the actual number of direct owes from shares vs payer.
  const expenses = await prisma.expense.findMany({ where: { groupId: group.id }, include: { shares: true } });
  rawTransactions = expenses.reduce((acc, exp) => acc + exp.shares.length, 0);

  res.json({
    pendingCount: pendingSettlements.length,
    settledCount,
    rawTransactions,
    simplifiedTransactions: pendingSettlements.length
  });
});

router.get("/history", async (req, res) => {
  // redirect logic or duplicate
  req.query.status = "SETTLED";
  return router.handle(req, res);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const [fromId, toId] = id.split("_");

  if (!fromId || !toId) {
    return res.status(400).json({ message: "Invalid ID format. Expected fromId_toId" });
  }

  if (!req.workspace) return res.status(404).json({ message: 'No workspace found' });

  const group = await prisma.group.findFirst({
    where: { workspaceId: req.workspace.id }
  });

  // Fetch all expenses paid by toId where fromId is a share
  const expenses = await prisma.expense.findMany({
    where: {
      groupId: group.id,
      paidById: toId,
      shares: {
        some: {
          userId: fromId
        }
      }
    },
    include: {
      shares: true
    }
  });

  const contributingExpenses = expenses.map(exp => {
    const share = exp.shares.find(s => s.userId === fromId);
    return {
      description: exp.description,
      share: share ? share.shareAmount : 0,
      date: exp.date
    };
  });

  res.json({
    fromId,
    toId,
    contributingExpenses
  });
});

router.post("/:id/settle", async (req, res) => {
  const { id } = req.params;
  const [fromId, toId] = id.split("_");

  if (!req.workspace) return res.status(404).json({ message: 'No workspace found' });

  const group = await prisma.group.findFirst({
    where: { workspaceId: req.workspace.id }
  });

  const balances = await calculateBalances(group.id, req.workspace.id);
  const settlements = simplifyDebts(balances);

  const exactDebt = settlements.find(s => s.fromId === fromId && s.toId === toId);

  if (!exactDebt) {
    return res.status(400).json({ message: "No pending debt between these users or debt is already settled." });
  }

  const payment = await prisma.payment.create({
    data: {
      fromUserId: fromId,
      toUserId: toId,
      amount: exactDebt.amount,
      workspaceId: req.workspace.id
    },
    include: {
      fromUser: true,
      toUser: true
    }
  });

  await createNotification("✅", `${payment.fromUser.name} settled ₹${payment.amount.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})} with ${payment.toUser.name}`, req.user.id);

  res.json({ message: "Settled successfully", payment });
});

module.exports = router;
