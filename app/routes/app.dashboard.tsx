// app/routes/dashboard.tsx

import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { fetchAndInsertProducts, getProductsFromDB } from "../api/fetchAndInsertData";

export const loader = async({request}:LoaderFunctionArgs) => {
  await fetchAndInsertProducts(request);

  const storedProducts = await getProductsFromDB();
  console.log("hello from inserting into db", storedProducts);

  return storedProducts;
}


export default function Dashboard() {
  const products = useLoaderData<typeof loader>();
  console.log(products, "products")
  return (
    <>
      <div>
        <h1>Products</h1>
        <ul>
          {products.map((product:any) => (
            <li key={product.id}>
              <h2>{product.title}</h2>
              <p>ID: {product.id}</p>
              <img src={product.imageUrl} alt={product.title} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
