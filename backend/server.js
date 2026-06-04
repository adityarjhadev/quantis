import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();

app.use(cors());
app.use(express.json());

const SECRET = "quantis_secret";

// temporary memory database
const users = [];

/* ---------------- SIGN UP ---------------- */
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const exists = users.find(u => u.email === email);
  if (exists) return res.status(400).json({ error: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  users.push({
    email,
    password: hashed,
  });

  res.json({ message: "User created" });
});

/* ---------------- SIGN IN ---------------- */
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: "Invalid login" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid login" });

  const token = jwt.sign({ email }, SECRET, { expiresIn: "7d" });

  res.json({ token });
});

/* ---------------- TEST ROUTE ---------------- */
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});