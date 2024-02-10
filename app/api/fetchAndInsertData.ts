import { PrismaClient } from "@prisma/client";
import { gql } from "graphql-request";
import { apiVersion, authenticate } from "~/shopify.server";

const prisma = new PrismaClient()

export const query = gql`
    query {
        products(first: 10){
            edges {
                node {
                    id
                    title
                    images(first: 1){
                        edges {
                            node {
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
            console.log(response.status)
        if(response.ok){
            const data = await response.json();
            
            const {data: {products: {edges}}} = data;

            await Promise.all(
                edges.map(async (edge: any) => {
                    const { node: product } = edge;
                    // Access image src from the correct location
                    const imageUrl = product.images.edges[0]?.node.src || null;
            
                    await prisma.product.create({
                        data: {
                            shopifyId: product.id,
                            title: product.title,
                            imageUrl: imageUrl, 
                        }
                    });
                })
            );
            console.log('edges from api',edges)
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
        console.log('storedProdcuts from api',storedProducts)
        return storedProducts;
    } catch (error) {
        console.error('Error fetching stored products from db: ', error);
        throw error;
    }
}