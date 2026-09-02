import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono/client";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.salons.$post, 201>;
type RequestType = InferRequestType<typeof client.api.salons.$post>["json"];

export const useCreateSalons = () => {
	const queryClient = useQueryClient();
	return useMutation<ResponseType, Error, RequestType>({
		mutationFn: async (json) => {
			const response = await client.api.salons.$post({ json });

			if (!response.ok) {
				throw new Error("Failed to create form");
			}

			return await response.json();
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["salons"] });
		},
	});
};

export function useSalons() {
	return useQuery({
		queryKey: ["salons"],
		queryFn: async () => {
			const res = await client.api.salons.$get();
			if (!res.ok) throw new Error("Failed to fetch salons");
			return res.json();
		},
	});
}

export function useSalon(id: string) {
	return useQuery({
		queryKey: ["salons", id],
		queryFn: async () => {
			const res = await client.api.salons[":id"].$get({ param: { id } });
			if (!res.ok) throw new Error("Failed to fetch salon");
			return res.json();
		},
		enabled: !!id,
	});
}

type UpdateResponseType = InferResponseType<
	(typeof client.api.salons)[":id"]["$patch"]
>;
type UpdateRequestType = InferRequestType<
	(typeof client.api.salons)[":id"]["$patch"]
>["json"];
export const useUpdateSalon = (id: string) => {
	const queryClient = useQueryClient();

	return useMutation<UpdateResponseType, Error, UpdateRequestType>({
		mutationFn: async (json) => {
			const response = await client.api.salons[":id"].$patch({
				param: { id },
				json,
			});

			if (!response.ok) {
				throw new Error("Failed to update salons");
			}

			return await response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["salons"] });
		},
	});
};

type DeleteResponseType = InferResponseType<
	(typeof client.api.salons)[":id"]["$delete"]
>;
export function useDeleteSalon(Id: string) {
	const queryClient = useQueryClient();

	return useMutation<DeleteResponseType, Error>({
		mutationFn: async () => {
			const res = await client.api.salons[":id"]["$delete"]({
				param: { id: Id },
			});
			if (!res.ok) throw new Error("Failed to delete");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["salons"] });
		},
	});
}
