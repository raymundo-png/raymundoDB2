const express = require("express");
const bcrypt = require("bcryptjs");
const { neon } = require("@neondatabase/serverless");

const app = express();
app.use(express.json());

const sql = neon(process.env.DATABASE_URL);

let ready;
function init() {
  if (!ready) {
    ready = sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )`;
  }
  return ready;
}

app.post("/api/register", async (req, res) => {
  try {
    await init();
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email is already registered." });
    }
    const hash = await bcrypt.hash(password, 10);
    await sql`INSERT INTO users (name, email, password) VALUES (${name}, ${email}, ${hash})`;
    res.json({ message: "Registered! You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during registration." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    await init();
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const rows = await sql`SELECT id, name, email, password FROM users WHERE email = ${email}`;
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    res.json({
      message: "Login successful!",
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during login." });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    await init();
    const users = await sql`SELECT id, name, email FROM users ORDER BY id`;
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load users." });
  }
});

module.exports = app;