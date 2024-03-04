// routes/api/optimizeImageById.ts

import Jimp from 'jimp';

import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { getFileNameFromUrl } from '~/models/getFileNameFromUrl';
import { installGlobals } from '@remix-run/node';
import { PrismaClient } from '@prisma/client';



const prisma = new PrismaClient();

export const optimizeImageById = async (productId:number) => {
    console.log(`entered into optimizeImageById for product no ${productId}`);
    const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

      const imageUrl = product?.imageUrl;
    try {
        if (imageUrl) {
            // Fetch the image from the URL
            const originalImage = await Jimp.read(imageUrl);

            const originalDimensions = { width: originalImage.getWidth(), height: originalImage.getHeight() };
            const extension = getFileNameFromUrl(imageUrl).split('.').pop()?.toLowerCase();

            // Get the MIME type based on the original extension
            const originalMIMEType = extension === 'jpg' || extension === 'jpeg' ? Jimp.MIME_JPEG : Jimp.MIME_PNG;

            // Get the buffer asynchronously
            const originalImageBuffer = await originalImage.getBufferAsync(originalMIMEType);

            // Optimize the image (example: resize and quality)
            originalImage.resize(800, Jimp.AUTO).quality(80); // Adjust parameters as needed

            // Get optimized image info
            const optimizedDimensions = { width: originalImage.getWidth(), height: originalImage.getHeight() };

            // Get the optimized image buffer asynchronously
            const optimizedImageBuffer = await originalImage.getBufferAsync(originalMIMEType);

            // Construct the file path to save the optimized image with the same extension
            const imageName = `${product.id}.${extension}`;
            const imagePath = path.resolve(__dirname, '../public/optimized_images', imageName);

            // Ensure the directory exists
            await mkdir(path.dirname(imagePath), { recursive: true });

            // Save the optimized image locally
            await writeFile(imagePath, optimizedImageBuffer);

            // Display information about the original and optimized images
            console.log(`Product ID: ${product.id}`);
            console.log('Original Image Info:', originalDimensions, `${(originalImageBuffer.length / 1024).toFixed(2)} KB`);
            console.log('Optimized Image Info:', optimizedDimensions, `${(optimizedImageBuffer.length / 1024).toFixed(2)} KB`);
        }
    

        console.log('Optimization complete');
    } catch (error) {
        console.error('Error optimizing images: ', error);
        throw error;
    }
};


        