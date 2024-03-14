import { PrismaClient } from "@prisma/client";
import { mkdir, stat, writeFile } from "fs/promises";
import { gql } from "graphql-request";
import path from "path";
import { apiVersion, authenticate } from "~/shopify.server";
import { getFileNameFromUrl } from "./getFileNameFromUrl";
import { optimizeExistingImages } from "./optimizeImages";
import { getImageInfo } from "./getImageInfo";

const prisma = new PrismaClient()

export const query = gql`
    query {
        products(first: 20){
            edges {
                node {
                    id
                    title
                    images(first: 1){
                        edges {
                            node {
                                width 
                                height
                                src
                            }
                        }
                    }
                }
            }
        }
    }
`;

export const fetchAndInsertProducts = async (request: Request) => {
    const { session } = await authenticate.admin(request)
    const {shop, accessToken} = session

    try {
        const response = await fetch(
            `https://${shop}/admin/api/${apiVersion}/graphql.json`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/graphql",
                    "X-Shopify-Access-Token": accessToken!,
                },
                body: query,
            }
        );
            
        if(response.ok){
            const data = await response.json();
            
            const {data: {products: {edges}}} = data;

            await Promise.all(
                edges.map(async (edge: any) => {
                    const { node: product } = edge;
                    // Access image src from the correct location
                    const imageUrl = product.images.edges[0]?.node.src || null;
                    const width = product.images.edges[0]?.node.width || null;
                    const height = product.images.edges[0]?.node.height || null;
                    const imageInfo = imageUrl ? await getImageInfo(imageUrl) : null;
                   // const extension = getFileNameFromUrl(imageUrl).split('.').pop()?.toLowerCase();
                   // console.log('image extension', extension)
                     // Check if the product with the same shopifyId already exists in the database
                     const existingProduct = await prisma.product.findUnique({
                        where: {
                            shopifyId: product.id
                        }
                    });

                    if(!existingProduct){

                        await prisma.product.create({
                            data: {
                                shopifyId: product.id,
                                title: product.title,
                                imageUrl: imageUrl, 
                                width: width,
                                height: height,
                                //mimeType: extension,
                               // width: imageInfo?.width || null,
                                //height: imageInfo?.height || null,
                                mimeType: imageInfo?.mimeType || null,
                                imageSize: imageInfo?.imageSize || null,
                            }
                        });
                    }
                })
            );
            //console.log('edges from api',edges)
            return edges;
            
        }
        return null;  

    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}

export const getProductsFromDB = async() => {
    try {
        const storedProducts = await prisma.product.findMany();

        /*
        for (const product of storedProducts) {
            const imageUrl = product.imageUrl;

            // Store the image locally if imageUrl exists
            if (imageUrl) {
                const imageName = getFileNameFromUrl(imageUrl);
                const imagePath = path.resolve(__dirname, '../public/images', imageName);

                try {
                    // Check if the image file already exists
                    await stat(imagePath);

                    // If the file exists, skip downloading and saving
                    console.log(`Image ${imageName} already exists locally. Skipping...`);
                } catch (error) {
                    // If the file doesn't exist, download and save it
                    console.log(`Downloading image ${imageName}...`);

                    const imageResponse = await fetch(imageUrl);
                    const imageBuffer = await imageResponse.arrayBuffer();

                    // Ensure the directory exists
                    await mkdir(path.dirname(imagePath), { recursive: true });

                    // Write the image to the images directory
                    await writeFile(imagePath, Buffer.from(imageBuffer));

                    console.log(`Image ${imageName} saved locally.`);
                }
            }
        }
        */
        //optimizeExistingImages()
        //console.log('storedProdcuts from api',storedProducts)
        return storedProducts;
    } catch (error) {
        console.error('Error fetching stored products from db: ', error);
        throw error;
    }
}