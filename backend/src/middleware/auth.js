const jwt = require("jsonwebtoken");

const prisma = require("../config/prisma");

const auth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      message: "No token"
    });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    const workspace = await prisma.workspace.findUnique({
      where: { ownerId: req.user.id }
    });

    if (workspace) {
      req.workspace = workspace;
    }

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid Token"
    });
  }
};

module.exports = auth;
