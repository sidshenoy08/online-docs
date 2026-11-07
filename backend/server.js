require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { login, register } = require("./auth/auth.js");

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL
}));

app.get("/login", (req, res) => {
    const authHeader = req.headers.authorization;
    login(authHeader);
    res.send(`Hello`);
});

app.get("/register", (req, res) => {
    const authHeader = req.headers.authorization;
    register(authHeader);
    res.send(`Hello`);
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});