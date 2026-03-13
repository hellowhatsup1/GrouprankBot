require('dotenv').config();
const noblox = require("noblox.js");
const express = require("express");

const app = express();
app.use(express.json());

const GROUP_ID = 52382117; // your group ID

async function startBot() {
    try {
        await noblox.setCookie(process.env.ROBLOX_COOKIE);
        const currentUser = await noblox.getAuthenticatedUser();
        console.log(`Roblox bot logged in as ${currentUser.name}`);
    } catch (err) {
        console.error("Failed to log in:", err);
    }
}

startBot(); // ✅ call this once when the bot starts

// Rank update endpoint
app.post("/rank", async (req, res) => {
    const { username, rankName } = req.body;
    try {
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

// ✅ Ping endpoint for uptime monitoring
app.get("/ping", (req, res) => {
    res.send("Bot is alive!");
});

// ✅ Handle HEAD requests (UptimeRobot default)
app.head("/ping", (req, res) => {
    res.sendStatus(200);
});

// ✅ Use Railway's dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot listening on port ${PORT}`));

