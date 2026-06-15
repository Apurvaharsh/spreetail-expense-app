const prisma = require("../config/prisma");

async function saveIssues(issues, importBatchId) {
  
  
  for (const issue of issues) {
    
    await prisma.importIssue.create({
      data: {
        rowNumber: issue.rowNumber,
        issueType: issue.type,
        severity: issue.severity,
        description: issue.type, // Could map to descriptive string later
        actionTaken: issue.action,
        importBatchId: importBatchId
      }
    });
  }
  
  
}

module.exports = saveIssues;