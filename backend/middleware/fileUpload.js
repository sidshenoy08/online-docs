const multer = require("multer");

const storage = multer.memoryStorage();

const uploadFile = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const isDocx = file.originalname.toLowerCase().endsWith(".docx");

    if (!isDocx) {
      return cb(new Error("Only .docx Word documents are allowed"));
    }

    cb(null, true);
  }
});

module.exports = uploadFile;