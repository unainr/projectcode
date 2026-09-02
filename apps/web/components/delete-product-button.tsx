// apps/web/components/delete-product-button.tsx
"use client";

import { client } from "@/lib/hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono/client";
import { Button } from "./ui/button";
import { useDeleteSalon } from "@/hooks/salons/use-salons";
import { toast } from "sonner";


export function DeleteProductButton({ Id }: { Id: string }) {
 const { mutate: deleteWorkspace, isPending: isDeleting } =useDeleteSalon(Id)
  const handleDelete = () => {
    if (!Id) return

    deleteWorkspace(undefined, {
      onSuccess: () => {
        toast.success("Workspace deleted successfully")
      },
    })
  }
  return (
    <Button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
    >
         {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}