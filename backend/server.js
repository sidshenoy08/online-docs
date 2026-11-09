require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { login, register } = require("./auth/auth.js");

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.get("/login", async (req, res) => {
    const authHeader = req.headers.authorization;
    const authResponse = await login(authHeader);

    const user = authResponse.user;
    const { accessToken, refreshToken } = authResponse.tokens;

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/auth',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken: accessToken, user: { id: user.id, email: user.email, name: user.name } });
});

app.get("/register", async (req, res) => {
    const authHeader = req.headers.authorization;
    const authResponse = await register(authHeader);

    const user = authResponse.user;
    const { accessToken, refreshToken } = authResponse.tokens;

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/auth',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken: accessToken, user: { id: user.id, email: user.email, name: user.name } });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});