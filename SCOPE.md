# Project Scope

## Database Schema
The database uses PostgreSQL and Prisma ORM. Here are the core models:

- **User**: Represents a person in the system. Stores authentication details.
- **Workspace/Group**: Users can create isolated groups to track specific sets of expenses together.
- **Expense**: A single transaction paid by one user, split among multiple members.
- **ExpenseShare**: The specific mathematical breakdown of who owes what for a specific Expense.
- **Payment**: A record of a settled debt (e.g. "User A paid User B $50").
- **ImportBatch & ImportIssue**: Tracks the CSV ingestion history and any anomalies flagged during the process.

## Anomaly Handling Log
When ingesting CSVs, the system detects and flags the following anomalies:

1. **Missing Payer (Action: Skipped)**
   - *Problem*: A row has no 'Paid By' email or name.
   - *Handling*: The row is skipped entirely. A "CRITICAL" issue is logged.

2. **Negative Amounts (Action: Converted to Positive)**
   - *Problem*: Some banking exports use negative numbers for expenses.
   - *Handling*: `Math.abs()` is applied to automatically convert it to a valid positive expense. An "INFO" issue is logged.

3. **Missing Split Data (Action: Defaulted to EQUAL)**
   - *Problem*: The user did not specify how the expense should be split.
   - *Handling*: The system defaults to an "EQUAL" split among all active group members at the time of the transaction. A "WARNING" issue is logged.

4. **Duplicate Detection (Action: Flagged for Review)**
   - *Problem*: The exact same amount, date, and description exist in the database.
   - *Handling*: The expense is imported, but flagged with a "WARNING" so the user can review and delete it if it was an accidental double-import.
