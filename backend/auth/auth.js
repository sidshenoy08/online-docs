const { scrypt, randomBytes, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const jwt = require('jsonwebtoken');

// const { db } = require("../src/prisma/db.ts");

const scryptAsync = promisify(scrypt);

// OWASP Recommended Parameters
const SCRYPT_OPTIONS = {
    N: 131072,
    r: 8,
    p: 1,
    maxmem: 128 * 131072 * 8 * 2
};

const KEY_LENGTH = 64; // length of the derived key

/**
 * hash a plain text password
 */
async function hashPassword(password) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await scryptAsync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
    return `${SCRYPT_OPTIONS.N}:${SCRYPT_OPTIONS.r}:${SCRYPT_OPTIONS.p}:${salt}:${derivedKey.toString('hex')}`;
}

/**
 * verify a plain text password against a stored string hash
 */
async function verifyPassword(password, storedPassword) {
    const [nStr, rStr, pStr, salt, hashHex] = storedPassword.split(':');

    const options = {
        N: parseInt(nStr, 10),
        r: parseInt(rStr, 10),
        p: parseInt(pStr, 10),
        maxmem: 128 * parseInt(nStr, 10) * parseInt(rStr, 10) * 2
    };

    const originalKey = Buffer.from(hashHex, 'hex');
    const currentKey = await scryptAsync(password, salt, originalKey.length, options);
    return timingSafeEqual(originalKey, currentKey);
}


function validateReqHeaders(authHeader) {
    if (!authHeader || !authHeader.startsWith("Basic ")) {
        return res.status(401).send("Unauthorized"); // TODO: handle status code in server.js
    }
    const [scheme, encodedCredentials] = authHeader.split(' ');
    if (scheme !== 'Basic' || !encodedCredentials) {
        return res.status(401).send('Invalid authentication scheme'); // TODO: handle status code in server.js
    }
    const decoded = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    return { username, password };
}


function generateTokens(user) {
    const payload = {
        id: user.id,
        email: user.email
    };

    const accessToken = jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
}


async function login(authHeader, db) {
    const { username, password } = validateReqHeaders(authHeader);

    const user = await db.orm.public.User.where({ email: username }).first();

    // await db.close();

    if (!user) {
        console.log("User not found!"); // TODO: return 401 Unauthorized
    }

    if (await verifyPassword(password, user.password)) {
        console.log(`User ${username} logged in!`); // successful login
        return { user: user, tokens: generateTokens(user) };
    } else {
        console.log("Invalid password!"); // TODO: return 401 Unauthorized
    }
}


async function register(authHeader, db) {
    const { username, password } = validateReqHeaders(authHeader);
    const dbHash = await hashPassword(password);

    const newUser = await db.orm.public.User.create({
        email: username,
        password: dbHash
    });

    // await db.close();

    if (newUser) {
        console.log(`User ${username} registered!`); // successful registration
        return { user: newUser, tokens: generateTokens(newUser) };
    } else {
        console.log(`Failed to register user ${username}`); // TODO: return 500 Internal Server Error
    }
}


async function refreshAuthTokens(currentRefreshToken, db) {
    const decodedToken = jwt.verify(
        currentRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await db.orm.public.User.first({ id: decodedToken.id });

    if (!user) {
        console.log("User not found through refresh token!"); // TODO: handle error - not just logging
    }

    return { user: user, tokens: generateTokens(user) };
}


module.exports = { login, register, refreshAuthTokens };