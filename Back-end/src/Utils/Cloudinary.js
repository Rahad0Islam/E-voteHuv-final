import {v2 as cloudinary} from 'cloudinary';
import { ApiError } from './ApiError.js';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

/**
 * Upload a file from either:
 *   - a Multer file object (memory storage) → uses file.buffer
 *   - a string file path (legacy / disk)      → uses cloudinary.uploader.upload
 *
 * Uploading from a buffer is serverless-safe (no filesystem writes),
 * which is required on platforms like Vercel where the project
 * directory is read-only.
 */
const FileUpload = async (input) => {
    if (!input) return null;

    // --- Path 1: Multer memoryStorage file object ---
    if (typeof input === 'object' && Buffer.isBuffer(input.buffer)) {
        try {
            const mime = input.mimetype || 'application/octet-stream';
            const dataUri = `data:${mime};base64,${input.buffer.toString('base64')}`;
            const UploadResponse = await cloudinary.uploader.upload(dataUri, {
                resource_type: 'auto',
                folder: 'e-votehub'
            });
            console.log('File is uploaded successfully', UploadResponse.url);
            return UploadResponse;
        } catch (error) {
            console.error('Cloudinary upload (buffer) failed:', error?.message || error);
            return null;
        }
    }

    // --- Path 2: Legacy string file path ---
    if (typeof input === 'string') {
        try {
            const UploadResponse = await cloudinary.uploader.upload(input, {
                resource_type: 'auto',
                folder: 'e-votehub'
            });
            console.log('File is uploaded successfully', UploadResponse.url);
            return UploadResponse;
        } catch (error) {
            console.error('Cloudinary upload (path) failed:', error?.message || error);
            return null;
        }
    }

    return null;
}



const FileDelete = async (Public_id) => {
    try {
        if (!Public_id) return null;
        const Response = await cloudinary.uploader.destroy(Public_id);
        console.log('File delete Successfully');
        return Response;
    } catch (error) {
        throw new ApiError(501, 'File can not deleted');
    }
}



export { FileUpload, FileDelete };