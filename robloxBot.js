const express = require("express");
const app = express();

// Healthcheck
app.use((req, res, next) => {
    if (req.method === "HEAD" && req.path === "/ping") {
        return res.sendStatus(200);
    }
    if (req.method === "GET" && req.path === "/ping") {
        return res.send("Bot is alive!");
    }
    next();
});

// 🚨 Force port 3000
app.listen(3000, () => console.log("Bot listening on port 3000"));
