require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { login, register, refreshAuthTokens } = require("./auth/auth.js");
const { db } = require("./src/prisma/db.ts");

const app = express();

app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.post("/login", async (req, res) => {
    const authHeader = req.headers.authorization;
    const authResponse = await login(authHeader, db);

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

app.post("/register", async (req, res) => {
    const authHeader = req.headers.authorization;
    const authResponse = await register(authHeader, db);

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

app.post("/auth/logout", (req, res) => {
    try {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return res.status(200).json({ message: "User logged out successfully!" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error while logging out user!" });
    }
});

app.post("/auth/refresh", async (req, res) => {
    const currentRefreshToken = req.cookies?.refreshToken;

    if (!currentRefreshToken) {
        return res.status(401).json({message: "Refresh token is missing!"});
    }

    const authResponse = await refreshAuthTokens(currentRefreshToken, db);

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