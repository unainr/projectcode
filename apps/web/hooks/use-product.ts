import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono/client";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
	typeof client.api.test.products.$post,
	201
>;
type RequestType = InferRequestType<
	typeof client.api.test.products.$post
>["json"];

export const useCreateProduct = () => {
	const queryClient = useQueryClient();
	return useMutation<ResponseType, Error, RequestType>({
		mutationFn: async (json) => {
			const response = await client.api.test.products.$post({ json });

			if (!response.ok) {
				throw new Error("Failed to create form");
			}

			return await response.json();
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
	});
};







export const useProduct = () => {
    return useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const res = await client.api.test.$get();
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            return data;
        }
    })
}



