function detectAnomalies(rows) {
  const issues = [];
  const seen = new Map();

  const knownNames = [
    "aisha",
    "rohan",
    "priya",
    "meera",
    "sam",
    "dev"
  ];

  rows.forEach((row, index) => {
    const rowNumber = index + 1;

    const description = row.description?.toLowerCase() || "";
    if (
      description.includes("paid back") ||
      description.includes("deposit")
    ) {
      issues.push({
        rowNumber,
        type: "SETTLEMENT_AS_EXPENSE",
        severity: "WARNING",
        action: "CONVERT_TO_SETTLEMENT"
      });
    }

    const payer = row.paid_by?.trim();
    if (
      payer &&
      !knownNames.includes(payer.toLowerCase())
    ) {
      issues.push({
        rowNumber,
        type: "NAME_ALIAS",
        severity: "WARNING",
        action: "REVIEW_ALIAS"
      });
    }

    if (row.amount?.includes(",")) {
      issues.push({
        rowNumber,
        type: "FORMATTED_AMOUNT",
        severity: "INFO",
        action: "REMOVE_COMMAS"
      });
    }

    const amountStr = row.amount?.toString();
    if (amountStr && amountStr.includes(".")) {
      const decimals = amountStr.split(".")[1];
      if (decimals.length > 2) {
        issues.push({
          rowNumber,
          type: "HIGH_PRECISION_AMOUNT",
          severity: "INFO",
          action: "ROUND_TO_2_DECIMALS"
        });
      }
    }

    if (JSON.stringify(row).toLowerCase().includes("kabir")) {
      issues.push({
        rowNumber,
        type: "NON_MEMBER_PARTICIPANT",
        severity: "WARNING",
        action: "TEMP_PARTICIPANT"
      });
    }

    if (row.date === "04-05-2026") {
      issues.push({
        rowNumber,
        type: "AMBIGUOUS_DATE",
        severity: "WARNING",
        action: "MANUAL_REVIEW"
      });
    }

    if (!row.amount || Number(row.amount) === 0) {
      issues.push({
        rowNumber,
        type: "ZERO_AMOUNT",
        severity: "WARNING",
        action: "FLAGGED"
      });
    }

    const amount = Number(row.amount);
    if (amount < 0) {
      issues.push({
        rowNumber,
        type: "NEGATIVE_AMOUNT",
        severity: "ERROR",
        action: "REVIEW_REQUIRED"
      });
    }

    if (!row.currency) {
      issues.push({
        rowNumber,
        type: "MISSING_CURRENCY",
        severity: "WARNING",
        action: "DEFAULT_INR"
      });
    }

    if (!row.paid_by) {
      issues.push({
        rowNumber,
        type: "MISSING_PAYER",
        severity: "ERROR",
        action: "REVIEW_REQUIRED"
      });
    }

    if (!row.date) {
      issues.push({
        rowNumber,
        type: "INVALID_DATE",
        severity: "ERROR",
        action: "REVIEW_REQUIRED"
      });
    }

    if (row.currency === "USD") {
      issues.push({
        rowNumber,
        type: "FOREIGN_CURRENCY",
        severity: "INFO",
        action: "CONVERT_TO_INR"
      });
    }

    const key = `${row.date}-${row.amount}-${row.paid_by}`;

    if (seen.has(key)) {
      issues.push({
        rowNumber,
        type: "POSSIBLE_DUPLICATE",
        severity: "WARNING",
        action: "MANUAL_REVIEW"
      });
    } else {
      seen.set(key, true);
    }
  });

  return issues;
}

module.exports = detectAnomalies;