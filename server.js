const express = require("express");
const path = require("path");
const { neon } = require("@neondatabase/serverless");

const app = express();
const PORT = process.env.PORT || 3000;

const sql = neon(process.env.DATABASE_URL);

app.use(express.json());
app.use(express.static(__dirname));

// Make sure the table exists. Safe to run on every cold start.
async function ensureTable() {
    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `;
}
ensureTable().catch(err => console.error("Failed to set up users table:", err));

// REGISTER
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({
            success: false,
            message: "Please fill in all fields."
        });
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
        const existing = await sql`SELECT id FROM users WHERE email = ${cleanEmail}`;

        if (existing.length > 0) {
            return res.json({
                success: false,
                message: "Email is already registered."
            });
        }

        await sql`
            INSERT INTO users (name, email, password)
            VALUES (${name.trim()}, ${cleanEmail}, ${password})
        `;

        res.json({
            success: true,
            message: "Registration successful!"
        });

    } catch (err) {
        console.error(err);
        res.json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
});

// LOGIN
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();

    try {
        const result = await sql`
            SELECT * FROM users
            WHERE email = ${cleanEmail} AND password = ${password}
        `;

        const user = result[0];

        if (!user) {
            return res.json({
                success: false,
                message: "Invalid email or password."
            });
        }

        res.json({
            success: true,
            message: "Login successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error(err);
        res.json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
});

// USERS
app.get("/users", async (req, res) => {
    try {
        const result = await sql`SELECT id, name, email FROM users ORDER BY id`;
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Could not fetch users." });
    }
});

// HOME
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Only start a listening server when run directly (local dev).
// On Vercel, the exported app is called per-request instead.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log("================================");
        console.log("       LOGIN SYSTEM");
        console.log("================================");
        console.log("Server running at:");
        console.log(`http://localhost:${PORT}`);
        console.log("================================");
    });
}

module.exports = app;