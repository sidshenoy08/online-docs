require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mammoth = require("mammoth");

const { db } = require("./src/prisma/db.ts");
const authenticateToken = require("./middleware/middleware.js");
const { login, register, refreshAuthTokens } = require("./auth/auth.js");
const { fetchDocuments, fetchDocumentContent, updateDocument, saveDocument, deleteDocument } = require("./db-queries/queries.js");
const uploadFile = require("./middleware/fileUpload.js");


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
            sameSite: 'lax',
            path: '/auth'
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
        return res.status(401).json({ message: "Refresh token is missing!" });
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

app.get("/fetch-docs", authenticateToken, async (req, res) => {
    try {
        const userDocs = await fetchDocuments(req.user.id, db);
        return res.status(200).json({ documents: userDocs, message: "Documents fetched successfully!" });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error while fetching documents!" });
    }
});

app.get("/fetch-doc-content/:docId", authenticateToken, async (req, res) => {
    try {
        const doc = await fetchDocumentContent(req.user.id, req.params.docId, db);
        return res.status(200).json({ document: doc, message: "Document content retrieved successfully!" });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error while fetching document content!" });
    }
});

app.patch("/update-doc", authenticateToken, async (req, res) => {
    try {
        const doc = await updateDocument(req.user.id, req.body.id, req.body.name, req.body.content, db);

        if (doc) {
            return res.status(200).json({ docId: doc.id, message: "Document updated successfully!" });
        } else {
            return res.status(404).json({ message: "Document not found!" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Internal server error while updating document!" });
    }
});

app.post("/save-doc", authenticateToken, async (req, res) => {
    try {
        const doc = await saveDocument(req.user.id, req.body.name, req.body.content, db);
        return res.status(200).json({ document: doc, message: "Document saved successfully!" });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error while saving document!" });
    }
});

app.delete("/delete-doc/:docId", authenticateToken, async (req, res) => {
    try {
        const doc = await deleteDocument(req.user.id, req.params.docId, db);

        if (doc) {
            return res.status(200).json({ message: "Document deleted successfully!" });
        } else {
            return res.status(404).json({ message: "Document not found!" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Internal server error while deleting document!" });
    }
});

app.post("/import-doc", authenticateToken, (req, res) => {
  uploadFile.single("file")(req, res, async (err) => {
    // if upload fails middleware validation
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          message: "File exceeds the 10 MB limit"
        });
      }
      return res.status(400).json({
        message: err.message
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded"
        });
      }

      // check that the uploaded file has a ZIP signature - docx files are zip-based
      const signature = req.file.buffer
        .subarray(0, 4)
        .toString("hex");

      if (signature !== "504b0304") {
        return res.status(400).json({
          message: "Invalid DOCX file"
        });
      }

      // convert DOCX to HTML
      const result = await mammoth.convertToHtml({
        buffer: req.file.buffer
      });

      if (!result.value.trim()) {
        return res.status(422).json({
          message: "The Word document contains no readable content"
        });
      }

      const fileName = req.file.originalname.replace(".docx", "");
      return res.status(200).json({
        message: "Word document imported successfully!",
        fileName: fileName,
        html: result.value,
        warnings: result.messages
      });
    } catch (error) {
      console.error("Document import error:", error);
      return res.status(500).json({
        message: "Failed to process Word document"
      });
    }
  });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});