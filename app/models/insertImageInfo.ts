
/*
import { getImageInfo } from "./getImageInfo";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const insertImageInfo = async () => {
    try {
        const products = await prisma.product.findMany();

        await Promise.all(products.map(async (product) => {
            const imageUrl = product.imageUrl;

            if (imageUrl) {
                const{width, height, imageSize, mimeType} = await getImageInfo(imageUrl);

                await prisma.product.create({
                    data: {
                        width: width,
                        height: height,
                        imageSize: imageSize,
                        mimeType: mimeType,
                        
                    }
                });
            }
            else {
                // If no image URL is available, create a placeholder image or set default values
                await prisma.product.create({
                    data: {
                        width: 0, 
                        height: 0, 
                        fileSize: 0, 
                        mimeType: 'image/jpg', 
                        
                        product: {
                            connect: { id: product.id }
                        },
                    }
                });
            }
        }));
    } catch (error) {
        console.error('Error in inserting image info', error);
    } finally {
        await prisma.$disconnect();
    }
}


export const getAllImageInfo = async () => {
    try {
        const allImageInfo = await prisma.imageInfo.findMany();
        return allImageInfo;
    } catch (error) {
        console.error('Error in fetching all image info', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

*/