const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: "Request body is required"
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: `${user.name}'s Workspace`,
        ownerId: user.id
      }
    });

    const group = await prisma.group.create({
      data: {
        name: `My First Group`,
        workspaceId: workspace.id
      }
    });

    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: user.id,
        joinedAt: new Date()
      }
    });

    return res.status(201).json({
      message: "User created",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        defaultGroupId: group.id,
        workspaceId: workspace.id
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error"
    });
  }
};

const login = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: "Request body is required"
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid Credentials"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user.id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error"
    });
  }
};

const getProfileStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const expensesProcessed = await prisma.expense.count({
      where: { group: { workspaceId: req.workspace.id } }
    });
    const anomaliesReviewed = await prisma.importIssue.count({
      where: { batch: { workspaceId: req.workspace.id } }
    });
    const settlementsGenerated = await prisma.payment.count({
      where: { workspaceId: req.workspace.id }
    });
    const importsCompleted = await prisma.importBatch.count({
      where: { workspaceId: req.workspace.id }
    });

    return res.json({
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      stats: {
        expensesProcessed,
        importsCompleted,
        anomaliesReviewed,
        settlementsGenerated
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error fetching profile stats" });
  }
};

module.exports = {
  register,
  login,
  getProfileStats
};
