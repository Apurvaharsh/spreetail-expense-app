function simplifyDebts(balances) {
  const creditors = [];
  const debtors = [];

  for (const person of balances) {
    if (person.balance > 0) {
      creditors.push({
        id: person.userId,
        name: person.name,
        amount: person.balance
      });
    }

    if (person.balance < 0) {
      debtors.push({
        id: person.userId,
        name: person.name,
        amount: Math.abs(person.balance)
      });
    }
  }

  const settlements = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(
      debtor.amount,
      creditor.amount
    );

    settlements.push({
      id: `${debtor.id}_${creditor.id}`,
      fromId: debtor.id,
      from: debtor.name,
      toId: creditor.id,
      to: creditor.name,
      amount
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) {
      i++;
    }

    if (creditor.amount === 0) {
      j++;
    }
  }

  return settlements;
}

module.exports = simplifyDebts;
