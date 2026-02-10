const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Memory storage — NO disk writes, Render-safe
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Reusable helper: upload buffer to Cloudinary via stream
const uploadToCloudinary = (buffer, folder, resourceType = 'auto') =>
    new Promise((resolve, reject) => {
        console.log(`[CLOUDINARY] Starting upload to folder: ${folder}, resourceType: ${resourceType}, bufferSize: ${buffer.length} bytes`);
        
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (error, result) => {
                if (error) {
                    console.error(`[CLOUDINARY] Upload FAILED:`, error);
                    reject(error);
                } else {
                    console.log(`[CLOUDINARY] Upload SUCCESS: ${result.public_id}`);
                    resolve(result);
                }
            }
        );
        
        streamifier.createReadStream(buffer).pipe(stream);
    });

module.exports = { cloudinary, upload, uploadToCloudinary };
