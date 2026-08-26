// apps/web/components/fetch-products.tsx
"use client";

import Image from "next/image";
import { useProduct } from "@/hooks/use-product"; // adjust path to wherever useProduct is defined
import { DeleteProductButton } from "./delete-product-button";

const FetchProducts = () => {
  const { data: products, isLoading, isError } = useProduct();

  if (isLoading) return <div>Loading products...</div>;
  if (isError) return <div>Failed to load products.</div>;
  if (!products || products.length === 0) return <div>No products found.</div>;

  return (
    <div className="flex flex-col gap-3">
      {products.map((product: any) => (
        <div
          key={product.id}
          className="flex items-center justify-between border rounded-md p-3"
        >
          <div className="flex items-center gap-3">
            <Image
              src={product.imageUrl || "/placeholder.png"}
              alt={product.name}
              width={50}
              height={50}
              className="rounded-md object-cover"
            />
            <span>{product.name}</span>
          </div>
          <DeleteProductButton productId={product.id} />
        </div>
      ))}
    </div>
  );
};

export default FetchProducts;