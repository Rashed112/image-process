import React, { FormEvent, useState } from 'react';
import { ActionFunction, LoaderFunction, json } from '@remix-run/node';
import { Form, Outlet, useActionData, useLoaderData } from '@remix-run/react';
import { fetchAndInsertProducts, getProductsFromDB } from '../models/fetchAndInsertData';
import { Button, Card, Grid, LegacyCard, Modal, Page, Toast } from '@shopify/polaris';
import { getFileNameFromUrl } from '~/models/getFileNameFromUrl';
import { optimizeImageById } from '~/models/optimizeImageById';


interface Product {
  id: number;
  title: string;
  imageUrl: string | null;
  imageId: string | null;
  width: number | null;
  optimizedWidth: number | null;
  height: number | null;
  optimizedHeight: number | null;
  imageSize: number | null;
  optimizedImageSize: number | null;
  mimeType: string | null;
  isCrushed: boolean;
  isRenamed: boolean;

}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const productId = form.get("productId");
  const actionType = form.get("actionType");
  
    const imageDetails = await optimizeImageById(request, Number(productId));
    //toast.success('Image optimized successfully!');
    //console.log(imageDetails);
    if(imageDetails){
      //shopify.toast.show('Successfully optimized');
      return json({
        message: "Successfully optimized",
      })
    }
    else {
      return json({
        message: "Optimization failed",
      })
    }
    
 
    //return new Response('Action completed successfully', { status: 200 });
};

export const loader: LoaderFunction = async ({ request }) => {
  await fetchAndInsertProducts(request);
  const products = await getProductsFromDB();
  //console.log('hello from inserting into db', products);
  return products;
};




export default function Dashboard() {
  const products = useLoaderData<typeof loader>();

  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageFileName, setSelectedImageFileName] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  

  const handleDetailsClick = (productId: number) => {
    setExpandedProductId((prevId) => (prevId === productId ? null : productId));
    
  };

  const handleCrushClick = () => {
    shopify.toast.show('Added to optimization queue...');
  }

  const handleCloseModal = () => {
    setSelectedImage(null);
    setSelectedImageFileName(null);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setSelectedImageFileName(getFileNameFromUrl(imageUrl));
  };

  const handlePaginationClick = (newPage: number) => {
    const nextPage = Math.max(1, Math.min(newPage, totalPages)); // Ensure the new page is within the valid range
  
    setCurrentPage(nextPage);
    setExpandedProductId(null);
  };

  const totalPages = products ? Math.ceil(products.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products ? products.slice(startIndex, endIndex) : [];


  

  return (
    <Page title="Products">

      <div style={{ alignItems: 'center', flexDirection: 'column' }}>
        
        <div style={{ padding: '16px' }}>
          <Card>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>File Name</th>                
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Renamed</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Crushed</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product: Product) => (
                  <React.Fragment key={product.id}>
                    <tr >
                      <td style={{ height: '50px', padding: '5px', border: '1px solid #ccc', textAlign:'center' }}>
                        {product.imageUrl && (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              style={{ cursor: 'pointer', maxWidth: '50px', maxHeight: '50px' }}
                              onClick={() => handleImageClick(product.imageUrl!)}
                            />
                            <div style={{ width: '150px', overflowWrap: 'break-word', marginLeft: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {getFileNameFromUrl(product.imageUrl)}
                            </div>
                          </div>
                        )}
                        {!product.imageUrl && (
                          <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f0f0' }}></div>
                        )}
                      </td>
                      
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign:'center' }}>{product.isRenamed ? 'Renamed' : 'Not Renamed'}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign:'center' }}>{product.isCrushed ? 'Crushed' : 'Not Crushed'}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign:'center' }}>
                      <button onClick={() => handleDetailsClick(product.id)}>Details</button>
                      {product.imageUrl && !product.isCrushed && 
                        <Form method="post">
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="actionType" value="crush" />
                          <button type="submit" onClick={handleCrushClick}>Crush</button>

                        </Form>
                      }
                      </td>
                    </tr>
                    {expandedProductId === product.id && (
                      <tr key={`${product.id}-details`}>
                        <td colSpan={5} style={{ border: '1px solid #ddd', padding: '8px' }}>
                          <Card>
                            <p>Product title: {product.title}</p>
                            <p>Product id: {product.id} </p>
                            <p>Product Image type: {product.mimeType} </p>
                          </Card>
                          <Grid>
                          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                            <LegacyCard title="Before Crush" sectioned>
                             
                                
                                  <p>Image Width: {product?.width}</p>
                                  <p>Image Height: {product?.height}</p>
                                  <p>Image File Size: {product?.imageSize} KB</p>
                                
                              
                            </LegacyCard>
                          </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                              <LegacyCard title="After Crush" sectioned>
                               
                                <p>Optimized Image Width: {product?.optimizedWidth} </p>
                                <p>Optimized Image Height: {product?.optimizedHeight}</p>
                                <p>Optimized Image Size: {product?.optimizedImageSize} KB</p>
                              </LegacyCard>
                            </Grid.Cell>
                          </Grid>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
        

       
          <div style={{ textAlign: 'center', padding:'16px' }}>
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

         
      </div>
  
      <Modal
        open={!!selectedImage}
        onClose={handleCloseModal}
        title={selectedImageFileName || ''}
        primaryAction={{
          content: 'Close',
          onAction: handleCloseModal,
        }}
      >
        <Modal.Section>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Large Image"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'fill' }}
            />
          )}
        </Modal.Section>
      </Modal>
    </Page>
  );
    
}