// routes/api/optimizeImage.ts

import { ActionFunction } from '@remix-run/node';
import { optimizeImageById } from '~/models/optimizeImageById.server';


export const action: ActionFunction = async ({ request, params }) => {
  console.log('inside optimizeImage.ts file')
  const productId = params.productId

  optimizeImageById(Number(productId))
  return new Response('Image optimized successfully', { status: 200 });
};
