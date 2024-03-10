import Jimp from 'jimp';
import { getFileNameFromUrl } from '~/models/getFileNameFromUrl';

interface ImageInfo {
    width: number; 
    height: number;
    imageSize: number;
    mimeType: string;
}

export const getImageInfo = async (imageUrl: string) => {
    //console.log(`entered into getOriginalImageInfo for product no ${imageUrl}`);
 
    // Fetch the image from the URL
    const image = await Jimp.read(imageUrl);

    const extension = getFileNameFromUrl(imageUrl).split('.').pop()?.toLowerCase();
    const width = image.getWidth();
    const height = image.getHeight();
    // Get the MIME type based on the original extension
    const mimeType = extension === 'jpg' || extension === 'jpeg' ? Jimp.MIME_JPEG : Jimp.MIME_PNG;

    // Get the buffer asynchronously
    const imageBuffer = await image.getBufferAsync(mimeType);

    //console.log('Image Info:', width, height, `${(imageBuffer.length / 1024).toFixed(2)} KB`, mimeType);

    const imageInfo: ImageInfo = {
        width,
        height,
        imageSize: parseFloat((imageBuffer.length / 1024).toFixed(2)),
        mimeType,
    };
    //console.log(imageInfo)
    return imageInfo;
        
};
