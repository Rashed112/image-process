import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { fetchAndInsertProducts, getProductsFromDB } from "../api/fetchAndInsertData";
import { DataTable, Page, Modal, Button, Pagination } from "@shopify/polaris";
import { useCallback, useState } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  await fetchAndInsertProducts(request);
  const storedProducts = await getProductsFromDB();
  console.log("hello from inserting into db", storedProducts);
  return storedProducts;
}

export default function Dashboard() {
  const products = useLoaderData<typeof loader>();
  const itemsPerPage = 5; // Adjust as needed
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageFileName, setSelectedImageFileName] = useState<string | null>(null);

  const handleImageClick = useCallback((imageUrl: string) => {
    setSelectedImage(imageUrl);
    const fileName = getFileNameFromUrl(imageUrl);
    setSelectedImageFileName(fileName);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
    setSelectedImageFileName(null);
  }, []);

  const getFileNameFromUrl = (url: string) => {
    const path = url.split('/');
    const fileNameWithQueryParams = path[path.length - 1]; // Get the file name with query parameters
    const fileNameParts = fileNameWithQueryParams.split('?'); // Split the file name and query parameters
    const fileName = fileNameParts[0]; // Get the file name without query parameters
    return fileName;
};

  interface Product {
    id: string;
    title: string;
    imageUrl: string | null;
    isRenamed: boolean;
    isCrushed: boolean;
  }

  const handleDetailsClick = (product: Product) => {
    // Handle details button click action
    console.log("Details button clicked for product:", product);
  };

  const handleCrushClick = (product: Product) => {
    // Handle crush button click action
    console.log("Crush button clicked for product:", product);
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  const rows = paginatedProducts.map((product: Product) => [
    product.imageUrl ? (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        
        <img
          src={product.imageUrl}
          alt={product.title}
          style={{ cursor: 'pointer', maxWidth: '50px', maxHeight: '50px' }}
          onClick={() => handleImageClick(product.imageUrl!)}
        />
        <div style={{ width:'150px', overflowWrap:'break-word', marginRight: '8px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{getFileNameFromUrl(product.imageUrl)}</div>
      </div>
    ) : null,

    product.title,
    product.isRenamed ? 'Renamed' : 'Not Renamed',
    product.isCrushed ? 'Crushed' : 'Not Crushed',

    <div>
      <Button onClick={() => handleDetailsClick(product)}>Details</Button>
      <Button onClick={() => handleCrushClick(product)}>Crush</Button>
    </div>
  ]);

  const handlePaginationClick = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <Page title="Products">
      <DataTable
        columnContentTypes={['text', 'text', 'text', 'text', 'text']}
        headings={['Image', 'Title', 'Renamed', 'Crushed', '']}
        rows={rows}
        verticalAlign="middle"
        footerContent={
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => handlePaginationClick(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ margin: '0 4px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
            >
              Prev
            </button>
            {[currentPage, currentPage + 1].map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePaginationClick(pageNumber)}
                style={{
                  margin: '0 4px',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: currentPage === pageNumber ? '#e0e0e0' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                {pageNumber}
              </button>
            ))}
            <button
              onClick={() => handlePaginationClick(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ margin: '0 4px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
            >
              Next
            </button>
          </div>
        }
      />
      
      <Modal
        open={!!selectedImage}
        onClose={handleCloseModal}
        title={selectedImageFileName || ""}
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
