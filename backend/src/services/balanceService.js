const prisma = require("../config/prisma");

async function calculateBalances(groupId, workspaceId) {
  const memberships = await prisma.groupMember.findMany({
    where: {
      groupId
    },
    include: {
      user: true
    }
  });

  const result = [];

  for (const membership of memberships) {
    const user = membership.user;

    const paidExpenses = await prisma.expense.findMany({
      where: {
        groupId,
        paidById: user.id
      }
    });

    const shares = await prisma.expenseShare.findMany({
      where: {
        userId: user.id,
        expense: {
          groupId
        }
      }
    });

    const paymentsMade = await prisma.payment.findMany({
      where: {
        workspaceId,
        fromUserId: user.id
      }
    });

    const paymentsReceived = await prisma.payment.findMany({
      where: {
        workspaceId,
        toUserId: user.id
      }
    });

    const totalPaid = paidExpenses.reduce(
      (sum, expense) => sum + (expense.convertedAmount || 0),
      0
    );

    const totalOwed = shares.reduce(
      (sum, share) => sum + share.shareAmount,
      0
    );

    const totalPaymentsMade = paymentsMade.reduce((sum, p) => sum + p.amount, 0);
    const totalPaymentsReceived = paymentsReceived.reduce((sum, p) => sum + p.amount, 0);

    result.push({
      userId: user.id,
      name: user.name,
      totalPaid,
      totalOwed,
      totalPaymentsMade,
      totalPaymentsReceived,
      balance: totalPaid - totalOwed + totalPaymentsMade - totalPaymentsReceived
    });
  }

  return result;
}

async function getBalanceBreakdown(groupId, userId) {
  const membership = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId
    },
    include: {
      user: true
    }
  });

  if (!membership) {
    return null;
  }

  const shares = await prisma.expenseShare.findMany({
    where: {
      userId,
      expense: {
        groupId
      }
    },
    include: {
      expense: true
    }
  });

  const expenses = shares.map((share) => ({
    description: share.expense.description,
    date: share.expense.date.toISOString().slice(0, 10),
    share: share.shareAmount
  }));

  const totalOwed = shares.reduce(
    (sum, share) => sum + share.shareAmount,
    0
  );

  return {
    user: membership.user.name,
    expenses,
    totalOwed
  };
}

module.exports = {
  calculateBalances,
  getBalanceBreakdown
};
