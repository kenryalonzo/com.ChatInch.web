import { v2 as clouadinary } from "cloudinary";

import { config } from "dotenv";

config();

clouadinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRECT,
});

export default clouadinary;