require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { login, register } = require("./auth/auth.js");

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL
}));

app.get("/login", async (req, res) => {
    const authHeader = req.headers.authorization;
    const { accessToken, refreshToken } = await login(authHeader);
    res.send(`Hello`);
});

app.get("/register", async (req, res) => {
    const authHeader = req.headers.authorization;
    const { accessToken, refreshToken } = await register(authHeader);
    console.log(`Access: ${accessToken}, Refresh: ${refreshToken}`);
    res.send(`Hello`);
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});