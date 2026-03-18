const express = require("express");
const app = express();

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

// ✅ Use Railway's dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Test app listening on port ${PORT}`));
