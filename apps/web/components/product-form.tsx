// apps/web/components/product-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
	Field,
	FieldLabel,
	FieldError,
	FieldGroup,
} from "@/components/ui/field";
import { ImageUploader } from "./image-uploader";

import { useMutation } from "@tanstack/react-query";
import { useCreateProduct } from "@/hooks/use-product";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const productSchema = z.object({
	name: z.string().min(1, "Name is required"),
	imageUrl: z.string().url("Upload an image first"),
	imageFileId: z.string().min(1),
});

export function ProductForm() {
	const { mutate, isPending } = useCreateProduct();

	const form = useForm({
		defaultValues: { name: "", imageUrl: "", imageFileId: "" },
		validators: { onSubmit: productSchema },
		onSubmit: ({ value }) => {
			mutate(value, {
				onSuccess: () => {
					toast.success("product creat success fully");
					form.reset();
				},
			});
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}>
			<FieldGroup>
				<form.Field name="name">
					{(field) => (
						<Field>
							<FieldLabel htmlFor={field.name}>Product name</FieldLabel>
							<Input
								id={field.name}
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<form.Field name="imageUrl">
					{(field) => (
						<Field>
							<FieldLabel>Product image</FieldLabel>
							<ImageUploader
								multiple={false}
								onUploaded={(result) => {
									field.handleChange(result.url);
									form.setFieldValue("imageFileId", result.fileId);
								}}
							/>
							<FieldError errors={field.state.meta.errors} />
						</Field>
					)}
				</form.Field>

				<Button type="submit" disabled={isPending}>
					{isPending ? "Saving..." : "Save product"}
				</Button>
			</FieldGroup>
		</form>
	);
}
