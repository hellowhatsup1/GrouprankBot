require('dotenv').config();
const noblox = require("noblox.js");
const express = require("express");

const app = express();
app.use(express.json());

const GROUP_ID = 52382117; // your group ID

// ✅ Force HEAD /ping to always return 200 instantly
app.use((req, res, next) => {
    if (req.method === "HEAD" && req.path === "/ping") {
        return res.sendStatus(200);
    }
    next();
});

// ✅ Ping endpoint for uptime monitoring
app.get("/ping", (req, res) => {
    res.send("Bot is alive!");
});

// Bot login
async function startBot() {
    try {
        await noblox.setCookie(process.env.ROBLOX_COOKIE);
        const currentUser = await noblox.getAuthenticatedUser();
        console.log(`Roblox bot logged in as ${currentUser.name}`);
    } catch (err) {
        console.error("Failed to log in:", err);
        // Keep app alive even if login fails
    }
}

startBot(); // ✅ call once at startup

// Rank update endpoint
app.post("/rank", async (req, res) => {
    const { username, rankName } = req.body;
    try {
        console.log("Rank request body:", req.body); // Debug log
        const userId = await noblox.getIdFromUsername(username);
        const roles = await noblox.getRoles(GROUP_ID);
        const targetRole = roles.find(r => r.name.toLowerCase() === rankName.toLowerCase());

        if (!targetRole) return res.status(400).send("Rank not found");

        await noblox.setRank(GROUP_ID, userId, targetRole.rank);
        console.log(`Successfully set ${username} to rank "${rankName}"`);
        res.send("Rank updated");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating rank");
    }
});

// ✅ Use Railway's dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot listening on port ${PORT}`));



