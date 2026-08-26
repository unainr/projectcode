// apps/web/components/delete-product-button.tsx
"use client";

import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono/client";
import { Button } from "./ui/button";


export function DeleteProductButton({ productId }: { productId: string }) {
type ResponseType = InferResponseType<
	(typeof client.api.test.products)[":id"]["$delete"]
>;
  const queryClient = useQueryClient();

  const deleteProduct = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.test.products[":id"]["$delete"]({
       param:{id:productId}
      })
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return (
    <Button
      type="button"
      onClick={() => deleteProduct.mutate()}
      disabled={deleteProduct.isPending}
    >
      {deleteProduct.isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}