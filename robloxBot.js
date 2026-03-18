require('dotenv').config();
const noblox = require("noblox.js");
const express = require("express");

const app = express();
app.use(express.json());

const GROUP_ID = 52382117; // your group ID

// ✅ Universal healthcheck handler (HEAD + GET)
app.use((req, res, next) => {
    if (req.method === "HEAD" && req.path === "/ping") {
        return res.sendStatus(200); // Railway/UptimeRobot health check
    }
    if (req.method === "GET" && req.path === "/ping") {
        return res.send("Bot is alive!"); // Manual/browser check
    }
    next();
});

// ✅ Safe bot login
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

startBot();

// ✅ Rank update endpoint
app.post("/rank", async (req, res) => {
    const { username, rankName } = req.body;
    try {
        console.log("Rank request body:", req.body);
        const userId = await noblox.getIdFromUsername(username);
        const roles = await noblox.getRoles(GROUP_ID);
        const targetRole = roles.find(r => r.name.toLowerCase() === rankName.toLowerCase());

        if (!targetRole) {
            console.log(`Rank "${rankName}" not found`);
            return res.status(400).send("Rank not found");
        }

        await noblox.setRank(GROUP_ID, userId, targetRole.rank);
        console.log(`Successfully set ${username} to rank "${rankName}"`);
        res.send("Rank updated");
    } catch (err) {
        console.error("Error updating rank:", err);
        res.status(500).send("Error updating rank");
    }
});

// ✅ Force port 8080 (to match Railway Public Networking)
app.listen(8080, () => console.log("Bot listening on port 8080"));
