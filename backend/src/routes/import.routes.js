const express = require("express");
const prisma = require("../config/prisma");
const upload = require("../middleware/upload");
const parseCSV = require("../importer/csvParser");
const detectAnomalies = require("../importer/anomalyDetector");
const saveIssues = require("../importer/importService");
const importExpenses = require("../importer/expenseImporter");
const { createNotification } = require("../services/notification.service");

const router = express.Router();

router.get("/issues", async (req, res) => {
  if (!req.workspace) return res.json([]);

  const issues = await prisma.importIssue.findMany({
    where: { batch: { workspaceId: req.workspace.id } },
    orderBy: {
      rowNumber: "asc"
    },
    select: {
      rowNumber: true,
      issueType: true,
      severity: true,
      description: true,
      actionTaken: true
    }
  });

  return res.json(issues);
});

router.post(
  "/csv",
  upload.single("file"),
  async (req, res) => {
    try {
      const fileName = req.file.originalname || "CSV file";

      // Clear previous import batches and issues for this workspace
      const existingBatches = await prisma.importBatch.findMany({ 
        where: { workspaceId: req.workspace.id } 
      });
      const batchIds = existingBatches.map(b => b.id);
      
      if (batchIds.length > 0) {
        await prisma.importIssue.deleteMany({ 
          where: { importBatchId: { in: batchIds } } 
        });
        await prisma.importBatch.deleteMany({ 
          where: { id: { in: batchIds } } 
        });
      }

      const importBatch = await prisma.importBatch.create({
        data: {
          fileName,
          workspaceId: req.workspace.id
        }
      });

      const rows = await parseCSV(req.file.path);

      const issues = detectAnomalies(rows);

      await saveIssues(issues, importBatch.id);

      await importExpenses(rows, req.workspace.id);

      await createNotification("📁", `${fileName} imported successfully`, req.user.id);

      if (issues.length > 0) {
        await createNotification("⚠️", `CSV imported with ${issues.length} anomalies`, req.user.id);
      }

      res.json({
        totalRows: rows.length,
        issuesFound: issues.length,
        issues
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ message: "Import failed: " + error.message });
    }
  }
);

module.exports = router;
