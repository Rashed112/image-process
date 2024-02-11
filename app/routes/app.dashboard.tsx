import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { fetchAndInsertProducts, getProductsFromDB } from "../api/fetchAndInsertData";
import { DataTable, Page, Modal, Button } from "@shopify/polaris";
import { useCallback, useState } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  await fetchAndInsertProducts(request);
  const storedProducts = await getProductsFromDB();
  console.log("hello from inserting into db", storedProducts);
  return storedProducts;
}

export default function Dashboard() {
  const products = useLoaderData<typeof loader>();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = useCallback((imageUrl: string) => {
    setSelectedImage(imageUrl);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const getFileNameFromUrl = (url: string) => {
    const path = url.split('/');
    return path[path.length - 1];
  };

  interface Product {
    id: string;
    title: string;
    imageUrl: string | null;
  }

  const rows = products.map((product: Product) => [
    product.id,
    product.imageUrl ? (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        
        <img
          src={product.imageUrl}
          alt={product.title}
          style={{ cursor: 'pointer', maxWidth: '50px', maxHeight: '50px' }}
          onClick={() => handleImageClick(product.imageUrl!)}
        />
        <div style={{ width:'150px',overflowWrap:'break-word', marginRight: '8px', whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{getFileNameFromUrl(product.imageUrl)}</div>
      </div>
    ) : null,

    product.title,
  ]);

  return (
    <Page title="Products">
      <DataTable
        columnContentTypes={['text', 'text', 'text']}
        headings={['ID', 'File Name', 'Title']}
        rows={rows}
        verticalAlign="middle"
        pagination={{
          hasNext: false,
          onNext: () => {},
        }}
      />
      <Modal
        open={!!selectedImage}
        onClose={handleCloseModal}
        title="Product Image"
        primaryAction={{
          content: 'Close',
          onAction: handleCloseModal,
        }}
      >
        <Modal.Section>
          {selectedImage && (
            <img src={selectedImage} alt="Large Image" style={{ maxWidth: '100%', maxHeight: '100%', objectFit:'fill' }} />
          )}
        </Modal.Section>
      </Modal>
    </Page>
  );
}
