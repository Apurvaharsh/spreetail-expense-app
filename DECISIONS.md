# Architectural Decisions

## Why Contributing Expenses are Approximated

For the `GET /api/settlements/:id` endpoint ("Why does person A owe person B?"), we return a list of "Contributing Expenses". 

**Problem:**
The core debt simplification algorithm reduces transactions into a minimum spanning graph. For example:
- Aisha pays $100 for Rohan
- Aisha pays $100 for Meera
- Meera pays $50 for Rohan
This results in net balances of: Aisha +$200, Rohan -$150, Meera -$50.
The simplified transfer is: Rohan pays Aisha $150, and Meera pays Aisha $50.

Because debts are fungible and consolidated during this simplification step, the exact mathematical lineage of *why* Rohan owes Aisha exactly $150 cannot be traced to a single expense (it involves a transitive debt from Meera). 

**Decision:**
To provide a meaningful and understandable UI to the user without overwhelming them with graph theory, we use an **engineering compromise**. When asked why Rohan owes Aisha, we return:
*All expenses where Aisha paid, and Rohan participated as a debtor.*

This provides the most logical, direct relationship between the two users, even if the final simplified number includes transitive offsets from the rest of the group.

## Dynamic Pending Settlements vs Persisted

**Problem:**
Storing "Suggested Settlements" as rows in a database table requires constant, exhaustive lifecycle management. If any user adds, edits, or deletes an expense, the entire `Settlement` table would need to be wiped and recalculated to reflect the new state.

**Decision:**
We treat the reconciliation loop as follows:
1. `Balances` are derived dynamically from Expenses and Payments.
2. `Pending Settlements` are generated purely on the fly by the simplification algorithm against current balances.
3. Only actual `Payments` (when a user clicks "Mark as Settled") are stored permanently in the database.

This exactly mimics the robust design of Splitwise, preventing database churn and ensuring the UI always reflects the single source of truth (balances).
