require('dotenv').config();
const noblox = require("noblox.js");
const express = require("express");

const app = express();
app.use(express.json());

const GROUP_ID = 52382117; // replace with your group ID

// ✅ Log every /ping request (HEAD or GET)
app.use((req, res, next) => {
    if (req.path === "/ping") {
        console.log(`[PING] ${req.method} request at ${new Date().toISOString()}`);
    }
    next();
});

// ✅ Healthcheck endpoint
app.use((req, res, next) => {
    if (req.method === "HEAD" && req.path === "/ping") return res.sendStatus(200);
    if (req.method === "GET" && req.path === "/ping") return res.send("Bot is alive!");
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
    }
}
startBot();

// ✅ Rank update endpoint (resolves by role name → role ID)
app.post("/rank", async (req, res) => {
    const { username, rankName } = req.body;
    try {
        console.log("Rank request body:", req.body);

        const userId = await noblox.getIdFromUsername(username);
        const roles = await noblox.getRoles(GROUP_ID);
        console.log("Roles in group:", roles);

        // Find role by name (case-insensitive)
        const targetRole = roles.find(
            r => r.name.toLowerCase() === rankName.toLowerCase()
        );

        if (!targetRole) {
            console.log(`Rank "${rankName}" not found`);
            return res.status(400).send("Rank not found");
        }

        // ✅ Use role ID instead of rank number to avoid duplicate conflicts
        await noblox.setRank(GROUP_ID, userId, targetRole.id);

        console.log(`Successfully set ${username} to role "${targetRole.name}" (ID: ${targetRole.id}, Rank: ${targetRole.rank})`);
        res.send(`Rank updated to ${targetRole.name}`);
    } catch (err) {
        console.error("Error updating rank:", err);
        res.status(500).send("Error updating rank");
    }
});

// ✅ Force port 8080 (to match Railway Public Networking)
app.listen(8080, () => console.log("Bot listening on port 8080"));
