import express from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/* REGISTER */
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await prisma.user.create({
      data: { email, password },
    });

    res.json({ success: true, userId: user.id });
  } catch (err) {
    if (err && err.code === "P2002") {
      return res.status(409).json({ message: "User already exists" });
    }

    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.status(401).json({ message: "Wrong password" });

  res.json({ success: true, userId: user.id });
});

/*Get*/
router.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      createdAt: true,
      password: true,
    },
  });

  res.json(users);
});

export default router;
