import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import {config } from 'dotenv';

config();
 // Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
 
const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
        //Upload the file on cloudinary
        const normalizedFilePath = localFilePath.replace(/\\/g, '/');
        if (!fs.existsSync(normalizedFilePath)) {
            console.error('File does not exist at path:', normalizedFilePath);
            return null;
        }else{
            console.log('It exists')
        }
         
       const uploadResult = await cloudinary.uploader.upload(normalizedFilePath,{
            //can put any resource type, here auto means it will detect itself whether its image or pdf etc.
            resource_type:"auto"
        })
        //now file is uploaded successfully
        console.log("File is uploaded on cloudinary",uploadResult.url)
        return uploadResult;
    } catch (err) {
        //fs.unlinkSync(localFilePath) //remove the locally saved temporary file
        console.error('Error uploading file to Cloudinary:', err.message);
           return null;
        }
}
export default uploadOnCloudinary
