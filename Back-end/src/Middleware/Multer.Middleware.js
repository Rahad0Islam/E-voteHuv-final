import multer from "multer";

// Use memory storage so files live in `req.files[i].buffer`.
// This avoids any local filesystem writes, which fail on serverless
// platforms like Vercel (the only writable path is /tmp, and writing
// to the project directory throws ENOENT).
const Storage = multer.memoryStorage();

export const upload = multer({ storage: Storage });