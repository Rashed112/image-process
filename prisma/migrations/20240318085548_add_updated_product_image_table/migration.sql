-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "height" INTEGER,
ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "imageSize" DOUBLE PRECISION,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "optimizedHeight" INTEGER,
ADD COLUMN     "optimizedImageSize" DOUBLE PRECISION,
ADD COLUMN     "optimizedWidth" INTEGER,
ADD COLUMN     "width" INTEGER;
