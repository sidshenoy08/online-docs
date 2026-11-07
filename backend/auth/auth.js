const { scrypt, randomBytes, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');

const { db } = require("../src/prisma/db.ts");

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
        return res.status(401).send("Unauthorized");
    }
    const [scheme, encodedCredentials] = authHeader.split(' ');
    if (scheme !== 'Basic' || !encodedCredentials) {
        return res.status(401).send('Invalid authentication scheme');
    }
    const decoded = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    return { username, password };
}


function login(authHeader) {
    const [username, password] = validateReqHeaders(authHeader);
    console.log(`Username: ${username}, Password: ${password}`);
}


async function register(authHeader) {
    const { username, password } = validateReqHeaders(authHeader);
    const dbHash = await hashPassword(password);

    const newUser = await db.orm.public.User.create({
        email: username,
        password: dbHash
    });

    console.log(newUser);

    await db.close();
}

module.exports = { login, register };