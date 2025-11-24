import multer from "multer";
import { getCloudinaryStorage } from "../config/cloudinary.js";

// Use Cloudinary storage for production, memory storage for development
const getStorage = () => {
    if (process.env.NODE_ENV === 'production') {
        return getCloudinaryStorage('tulumbak-uploads');
    }
    // In development, use memory storage to avoid filesystem writes
    return multer.memoryStorage();
};

const upload = multer({
    storage: getStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export default upload;