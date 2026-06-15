const prisma = require("../config/prisma");

const createExpense = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: "Request body is required"
      });
    }

    const {
      description,
      amount,
      currency,
      date,
      splitType,
      paidById,
      shares // Expect optional shares array: [{ userId, value }]
    } = req.body;

    if (
      !description ||
      amount === undefined ||
      !currency ||
      !date ||
      !splitType ||
      !paidById
    ) {
      return res.status(400).json({
        message: "Description, amount, currency, date, splitType, and paidById are required"
      });
    }

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
        message: 'No group found for this user'
      });
    }

    const payer = await prisma.user.findUnique({
      where: {
        id: paidById
      }
    });

    if (!payer) {
      return res.status(400).json({
        message: "Invalid paidById"
      });
    }

    const expenseDate = new Date(date);
    if (Number.isNaN(expenseDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date"
      });
    }

    const endOfDay = new Date(expenseDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const activeMembers = await prisma.groupMember.findMany({
      where: {
        groupId: group.id,
        joinedAt: {
          lte: endOfDay
        },
        OR: [
          {
            leftAt: null
          },
          {
            leftAt: {
              gte: expenseDate
            }
          }
        ]
      }
    });

    if (activeMembers.length === 0) {
      return res.status(400).json({
        message: "No active members found for this expense date"
      });
    }

    const numAmount = Number(amount);

    // Validate shares before creating the expense
    if (splitType === "EXACT") {
      if (!shares || !Array.isArray(shares) || shares.length === 0) {
        return res.status(400).json({ message: "Shares are required for EXACT split" });
      }
      const sum = shares.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
      if (Math.abs(sum - numAmount) > 0.01) {
        return res.status(400).json({ message: `Exact amounts must sum to ${numAmount}. Current sum is ${sum}.` });
      }
    } else if (splitType === "PERCENTAGE") {
      if (!shares || !Array.isArray(shares) || shares.length === 0) {
        return res.status(400).json({ message: "Shares are required for PERCENTAGE split" });
      }
      const sum = shares.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
      if (Math.abs(sum - 100) > 0.01) {
        return res.status(400).json({ message: `Percentages must sum to 100%. Current sum is ${sum}%.` });
      }
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: numAmount,
        currency,
        convertedAmount: numAmount,
        date: expenseDate,
        splitType,
        paidById,
        groupId: group.id
      }
    });

    if (splitType === "EQUAL") {
      const shareAmount = numAmount / activeMembers.length;
      for (const member of activeMembers) {
        await prisma.expenseShare.create({
          data: {
            expenseId: expense.id,
            userId: member.userId,
            shareAmount,
            notes: description
          }
        });
      }
    } else {
      // EXACT or PERCENTAGE
      for (const member of activeMembers) {
        const share = shares.find(s => s.userId === member.userId);
        let shareAmount = 0;
        
        if (share) {
          if (splitType === "EXACT") {
            shareAmount = Number(share.value);
          } else if (splitType === "PERCENTAGE") {
            shareAmount = numAmount * (Number(share.value) / 100);
          }
        }

        if (shareAmount > 0) {
          await prisma.expenseShare.create({
            data: {
              expenseId: expense.id,
              userId: member.userId,
              shareAmount,
              notes: description
            }
          });
        }
      }
    }

    return res.status(201).json(expense);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error"
    });
  }
};

const getExpenses = async (req, res) => {
  if (!req.workspace) {
    return res.json([]);
  }

  const group = await prisma.group.findFirst({
    where: { workspaceId: req.workspace.id }
  });

  if (!group) {
    return res.json([]);
  }

  const expenses = await prisma.expense.findMany({
    where: { groupId: group.id },
    include: {
      paidBy: true
    },
    orderBy: [
      { date: "desc" },
      { createdAt: "desc" }
    ]
  });

  return res.json(expenses);
};

const getExpenseById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        paidBy: true,
        shares: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    
    // Map shares to participants for frontend
    const expenseWithParticipants = {
      ...expense,
      participants: expense.shares.map(s => ({
        id: s.id,
        amount: s.shareAmount,
        splitValue: s.splitValue,
        user: s.user
      }))
    };
    
    return res.json(expenseWithParticipants);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteExpense = async (req, res) => {
  const { id } = req.params;

  await prisma.expenseShare.deleteMany({
    where: {
      expenseId: id
    }
  });

  await prisma.expense.delete({
    where: {
      id
    }
  });

  return res.json({
    message: "Deleted"
  });
};

const updateExpense = async (req, res) => {
  const { id } = req.params;
  const {
    description,
    amount
  } = req.body;

  const expense = await prisma.expense.update({
    where: {
      id
    },
    data: {
      description,
      amount: Number(amount),
      convertedAmount: Number(amount)
    }
  });

  return res.json(expense);
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  deleteExpense,
  updateExpense
};
