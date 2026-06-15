const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const expenseRoutes = require("./routes/expense.routes");
const importRoutes = require("./routes/import.routes");
const balanceRoutes = require("./routes/balance.routes");
const settlementRoutes = require("./routes/settlement.routes");
const groupRoutes = require("./routes/group.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const auth = require("./middleware/auth");

app.use("/api/auth", authRoutes);
app.use("/api/expenses", auth, expenseRoutes);
app.use("/api/import", auth, importRoutes);
app.use("/api/balances", auth, balanceRoutes);
app.use("/api/settlements", auth, settlementRoutes);
app.use("/api/groups", auth, groupRoutes);
app.use("/api/notifications", auth, notificationRoutes);

app.get("/", (req, res) => {
  res.send("Expense App API Running");
});

module.exports = app;
