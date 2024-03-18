import { apiVersion, authenticate } from "~/shopify.server";

/*
export const uploadOptimizedProductImage = async (shop: string, accessToken: string, productShopifyId: number, optimizedImageBuffer: Buffer) => {
    try {
        const base64Image = Buffer.from(optimizedImageBuffer).toString('base64');
        
        const body = JSON.stringify({
            image: {
                attachment: base64Image
            }
        });

        const response = await fetch(
            `https://${shop}/admin/api/${apiVersion}/products/${productShopifyId}/images.json`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': accessToken
                },
                body: body
            }
        );

        if (!response.ok) {
            const errorResponseData = await response.text();
            if (errorResponseData.includes('Invalid Product')) {
                throw new Error(`Failed to upload optimized product image: Product with ID ${productShopifyId} does not exist.`);
            }
            throw new Error(`Failed to upload optimized product image. Status: ${response.status}. Response: ${errorResponseData}`);
        }
        
        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(`Failed to upload optimized product image: ${responseData.errors}`);
        }

        return responseData.image.src; // Return the URL of the uploaded image
    } catch (error) {
        console.error('Error uploading optimized product image:', error);
        throw error;
    }
};
*/

/*export const updateProductImage = async (shop: string, accessToken: string, productId: number, imageUrl: string, updatedImageUrl: string) => {
    try {
        const body = JSON.stringify({
            product: {
                id: productId,
                images: [
                    {
                        id: imageUrl.split('/').pop(), // Extract the image ID from the original image URL
                        src: updatedImageUrl // Set the updated image URL
                    }
                ]
            }
        });
        
        const response = await fetch(
            `https://${shop}/admin/api/${apiVersion}/products/${productId}.json`,
            {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': accessToken
                },
                body: body
            }
        );

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(`Failed to update product image: ${responseData.errors}`);
        }

        return responseData;
    } catch (error) {
        console.error('Error updating product image:', error);
        throw error;
    }
};
*/
/*
export const updateProductImage = async (
    request: Request,
    productShopifyId: number,
    optimizedImageUrl: string
  ) => {
      const {admin, session} = await authenticate.admin(request);
      try {
        const image = new admin.rest.resources.Image({session: session});
  
      image.product_id = productShopifyId;
      image.src = optimizedImageUrl;
      image.position = 1;
  
      // Save the image, updating the existing image
      await image.save({ update: true });
    } catch (error) {
      console.error('Error updating product image:', error);
      throw error;
    }
  };
*/


  export const uploadOptimizedProductImage = async (request: Request, shop: string, accessToken: string, productShopifyId: number, imageId:string,  optimizedImageBuffer: Buffer) => {
    try {
        const {admin, session} = await authenticate.admin(request);
        const base64Image = Buffer.from(optimizedImageBuffer).toString('base64');
        const body = JSON.stringify({
            image: {
                attachment: base64Image
            }
        });

        const response = await fetch(
            `https://${shop}/admin/api/${apiVersion}/products/${productShopifyId}/images.json`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': accessToken
                },
                body: body
            }
        );
/*
        if (!response.ok) {
            const errorResponseData = await response.text();
            if (errorResponseData.includes('Invalid Product')) {
                throw new Error(`Failed to upload optimized product image: Product with ID ${productShopifyId} does not exist.`);
            }
            throw new Error(`Failed to upload optimized product image. Status: ${response.status}. Response: ${errorResponseData}`);
        }
*/       
        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(`Failed to upload optimized product image: ${responseData.errors}`);
        }

        const image = new admin.rest.resources.Image({session: session});
        const productImageId = extractProductIdFromUrl(imageId)
      image.product_id = productShopifyId;
      //console.log('extracted image id ', extractProductIdFromUrl(imageId));
      //image.id = productImageId;
      image.src = responseData.image.src;
      image.position = 1;
  
      // Save the image, updating the existing image
      await image.save({ update: true });
        
        //return responseData.image.src; // Return the URL of the uploaded image
    } catch (error) {
        console.error('Error uploading optimized product image:', error);
        throw error;
    }
};

function extractProductIdFromUrl(url: string) {
    const regex = /\/(\d+)$/;
    const match = url.match(regex);
    if (match && match[1]) {
        return parseInt(match[1]);
    }
    return null;
}