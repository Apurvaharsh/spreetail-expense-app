const prisma = require("../config/prisma");
const getActiveMembers = require("./getActiveMembers");

const USER_MAP = {
  aisha: "Aisha",
  rohan: "Rohan",
  priya: "Priya",
  "priya s": "Priya",
  meera: "Meera",
  sam: "Sam",
  dev: "Dev"
};

function convertToINR(amount, currency) {
  if (currency === "USD") {
    return amount * 83;
  }
  return amount;
}

function parseAmount(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return Number.NaN;
  return parseFloat(value.replace(/,/g, ""));
}

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (!trimmedValue) return null;
    
    const dashMatch = trimmedValue.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dashMatch) {
      const [, first, second, year] = dashMatch;
      const dayFirstDate = new Date(`${year}-${second.padStart(2, "0")}-${first.padStart(2, "0")}T00:00:00Z`);
      if (!Number.isNaN(dayFirstDate.getTime())) return dayFirstDate;
    }
    
    const directDate = new Date(trimmedValue);
    if (!Number.isNaN(directDate.getTime())) return directDate;
  }
  return null;
}

async function importExpenses(rows, workspaceId) {
  let group = await prisma.group.findFirst({ where: { workspaceId } });
  
  if (!group) {
    throw new Error('Workspace must have at least one group');
  }
  const GROUP_ID = group.id;

  const allUsers = await prisma.user.findMany();
  const userByName = {};
  for (const u of allUsers) {
    userByName[u.name.toLowerCase()] = u;
  }

  async function getOrCreateUserAndMember(rawName) {
    if (!rawName) return null;
    const cleanName = rawName.trim();
    if (!cleanName) return null;
    
    const mappedName = USER_MAP[cleanName.toLowerCase()] || cleanName;
    const lowerName = mappedName.toLowerCase();
    
    let user = userByName[lowerName];
    if (!user) {
      const email = `${mappedName.replace(/\s+/g, '').toLowerCase()}_${Math.random().toString(36).substring(7)}@spreetail.com`;
      user = await prisma.user.create({
        data: {
          name: mappedName,
          email: email,
          password: "imported_user"
        }
      });
      userByName[lowerName] = user;
    }

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: GROUP_ID,
          userId: user.id
        }
      }
    });

    if (!member) {
      await prisma.groupMember.create({
        data: {
          groupId: GROUP_ID,
          userId: user.id,
          joinedAt: new Date()
        }
      });
    }
    
    return user;
  }

  for (const row of rows) {
    if (!row.paid_by || !row.date) continue;

    const payer = await getOrCreateUserAndMember(row.paid_by);
    if (!payer) continue;

    const amount = parseAmount(row.amount);
    if (Number.isNaN(amount)) continue;

    const expenseDate = parseDate(row.date);
    if (!expenseDate) continue;

    const currency = row.currency || "INR";
    const convertedAmount = convertToINR(amount, currency);

    const existingExpense = await prisma.expense.findFirst({
      where: {
        groupId: GROUP_ID,
        description: row.description,
        amount: amount,
        date: expenseDate,
        paidById: payer.id
      }
    });

    if (existingExpense) continue;

    const splitType = (row.split_type || "equal").trim().toLowerCase();
    const splitWithStr = (row.split_with || "").trim();
    const splitDetailsStr = (row.split_details || "").trim();

    let splitUsers = [];
    if (splitWithStr) {
      const names = splitWithStr.split(";");
      for (const name of names) {
         const user = await getOrCreateUserAndMember(name);
         if (user) splitUsers.push(user);
      }
    } else {
      const currentMembers = await prisma.groupMember.findMany({ where: { groupId: GROUP_ID } });
      for (const m of currentMembers) {
         const u = await prisma.user.findUnique({ where: { id: m.userId } });
         if (u) splitUsers.push(u);
      }
    }
    
    // Deduplicate users
    splitUsers = [...new Map(splitUsers.map(item => [item.id, item])).values()];
    if (splitUsers.length === 0) continue;

    const expense = await prisma.expense.create({
      data: {
        description: row.description,
        amount,
        currency,
        convertedAmount,
        exchangeRate: currency === "USD" ? 83 : null,
        date: expenseDate,
        splitType: splitType,
        groupId: GROUP_ID,
        paidById: payer.id
      }
    });

    const sharesToCreate = [];
    
    if (splitType === "equal" || !splitDetailsStr) {
      const shareAmount = convertedAmount / splitUsers.length;
      for (const u of splitUsers) {
        sharesToCreate.push({ userId: u.id, shareAmount, splitValue: null });
      }
    } else {
      const parts = splitDetailsStr.split(";").map(p => p.trim()).filter(p => p);
      const detailMap = {};
      for (const part of parts) {
        const lastSpaceIdx = part.lastIndexOf(" ");
        if (lastSpaceIdx === -1) continue;
        const namePart = part.substring(0, lastSpaceIdx).trim().toLowerCase();
        const valPart = part.substring(lastSpaceIdx + 1).trim();
        const mappedName = USER_MAP[namePart] ? USER_MAP[namePart].toLowerCase() : namePart;
        detailMap[mappedName] = valPart;
      }

      if (splitType === "unequal") {
        let totalAssigned = 0;
        let unassignedUsers = [];
        
        for (const u of splitUsers) {
          const valStr = detailMap[u.name.toLowerCase()];
          if (valStr) {
             const amt = parseFloat(valStr.replace(/,/g, ''));
             const inrAmt = convertToINR(amt, currency);
             sharesToCreate.push({ userId: u.id, shareAmount: inrAmt, splitValue: amt });
             totalAssigned += inrAmt;
          } else {
             unassignedUsers.push(u);
          }
        }
        
        const remaining = convertedAmount - totalAssigned;
        if (unassignedUsers.length > 0 && remaining > 0) {
          const shareAmount = remaining / unassignedUsers.length;
          for (const u of unassignedUsers) {
            sharesToCreate.push({ userId: u.id, shareAmount, splitValue: shareAmount });
          }
        } else if (unassignedUsers.length > 0) {
          for (const u of unassignedUsers) {
            sharesToCreate.push({ userId: u.id, shareAmount: 0, splitValue: 0 });
          }
        }
      } else if (splitType === "percentage") {
        let totalPercent = 0;
        const parsedMap = {};
        for (const u of splitUsers) {
          const valStr = detailMap[u.name.toLowerCase()];
          if (valStr && valStr.endsWith("%")) {
            const pct = parseFloat(valStr.substring(0, valStr.length - 1));
            parsedMap[u.id] = pct;
            totalPercent += pct;
          }
        }
        
        for (const u of splitUsers) {
           const pct = parsedMap[u.id] || 0;
           const normalizedPct = totalPercent > 0 ? (pct / totalPercent) : (1 / splitUsers.length);
           sharesToCreate.push({ userId: u.id, shareAmount: convertedAmount * normalizedPct, splitValue: pct });
        }
      } else if (splitType === "share") {
        let totalShares = 0;
        const parsedMap = {};
        for (const u of splitUsers) {
          const valStr = detailMap[u.name.toLowerCase()];
          if (valStr) {
            const sh = parseFloat(valStr);
            parsedMap[u.id] = sh;
            totalShares += sh;
          }
        }
        
        for (const u of splitUsers) {
           const sh = parsedMap[u.id] || 0;
           const normalizedPct = totalShares > 0 ? (sh / totalShares) : (1 / splitUsers.length);
           sharesToCreate.push({ userId: u.id, shareAmount: convertedAmount * normalizedPct, splitValue: sh });
        }
      } else {
        const shareAmount = convertedAmount / splitUsers.length;
        for (const u of splitUsers) {
          sharesToCreate.push({ userId: u.id, shareAmount, splitValue: null });
        }
      }
    }

    for (const share of sharesToCreate) {
      await prisma.expenseShare.create({
        data: {
          expenseId: expense.id,
          userId: share.userId,
          shareAmount: share.shareAmount,
          splitValue: share.splitValue,
          notes: row.description
        }
      });
    }
  }
}

module.exports = importExpenses;
