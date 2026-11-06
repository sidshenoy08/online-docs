require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL
}));

app.get("/login", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Basic ")) {
        return res.status(401).send("Unauthorized");
    }

    const [scheme, encodedCredentials] = authHeader.split(' ');

    if (scheme !== 'Basic' || !encodedCredentials) {
        return res.status(401).send('Invalid authentication scheme');
    }

    const decoded = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    console.log(`Username: ${username}, Password: ${password}`);
  
    res.send(`Hello ${username}`);
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});