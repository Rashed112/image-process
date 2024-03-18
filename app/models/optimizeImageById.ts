import Jimp from 'jimp';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { getFileNameFromUrl } from '~/models/getFileNameFromUrl';
import { PrismaClient } from '@prisma/client';
import { uploadOptimizedProductImage, } from './updateImage'; // Import the functions for uploading and updating images

import { authenticate } from '~/shopify.server';

const prisma = new PrismaClient();

export const optimizeImageById = async (request: Request, productId:number) => {
    const { session } = await authenticate.admin(request)
    if (!session) {
        console.error('Session is undefined');
        return null;
    }
    const {shop, accessToken} = session
    
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

            // Construct the file path to save the optimized image with the same extension
            const imageName = `${product.id}.${extension}`;
            const originalMIMEType = extension === 'jpg' || extension === 'jpeg' ? Jimp.MIME_JPEG : Jimp.MIME_PNG;

            // Get the buffer asynchronously
            const originalImageBuffer = await originalImage.getBufferAsync(originalMIMEType);
            const originalImagePath = path.resolve(__dirname, '../public/original_images', imageName);

            // Ensure the directory exists
            await mkdir(path.dirname(originalImagePath), { recursive: true });

            // Save the optimized image locally
            await writeFile(originalImagePath, originalImageBuffer);

            const targetWidth = Math.round(0.8 * originalImage.getWidth());
            // Optimize the image (example: resize and quality)
            originalImage.resize(targetWidth, Jimp.AUTO).quality(80);

            // Get optimized image info
            const optimizedWidth = originalImage.getWidth();
            const optimizedHeight = originalImage.getHeight();

            // Get the optimized image buffer asynchronously
            const optimizedImageBuffer = await originalImage.getBufferAsync(originalMIMEType);
            const optimizedImageSize = Number((optimizedImageBuffer.length / 1024).toFixed(2));

            //const imagePath = path.resolve(__dirname, '../public/optimized_images', imageName);

            // Ensure the directory exists
            //await mkdir(path.dirname(imagePath), { recursive: true });

            // Save the optimized image locally
            //await writeFile(imagePath, optimizedImageBuffer);
            
            await prisma.product.update({
                where: { id: productId },
                data: {
                    optimizedWidth,
                    optimizedHeight,
                    optimizedImageSize,
                },
            });

            const imageDetails = {
                optimizedWidth,
                optimizedHeight,
                optimizedImageSize,
            };

            const productShopifyId = extractProductIdFromUrl(product.shopifyId);

            // Upload the optimized image and get the updated image URL
            //const updatedImageUrl = await uploadOptimizedProductImage(shop, accessToken!, productShopifyId!, optimizedImageBuffer);
            await uploadOptimizedProductImage(request, shop, accessToken!, productShopifyId!, optimizedImageBuffer);
            // Update the product image URL with the URL of the optimized image
           // await updateProductImage(shop, accessToken!, product.id, imageUrl, updatedImageUrl);
            //await updateProductImage(request, productShopifyId!, updatedImageUrl);
            return imageDetails;
        }
    
        console.log('Optimization complete');
        return null;
    } catch (error) {
        console.error('Error optimizing images: ', error);
        throw error;
    }
};

function extractProductIdFromUrl(url:string) {
    const regex = /\/Product\/(\d+)/;
    const match = url.match(regex);
    if (match && match[1]) {
        return parseInt(match[1]);
    }
    return null
}