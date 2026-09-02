"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	InputGroupTextarea,
} from "@/components/ui/input-group";
import { useSalon, useUpdateSalon } from "@/hooks/salons/use-salons";
import { formSchema } from "@/modules/schema/salon-form-schema";
import { Spinner } from "@/components/ui/spinner";

export function SalonEditForm({ salonId }: { salonId: string }) {
	const { data: salon, isLoading } = useSalon(salonId);
	const { mutate, isPending } = useUpdateSalon(salonId);

	const form = useForm({
		defaultValues: {
			name: salon?.name ?? "",
			description: salon?.description ?? "",
			city: salon?.city ?? "",
			address: salon?.address ?? "",
			phone: salon?.phone ?? "",
		},
		validators: { onSubmit: formSchema },
		onSubmit: ({ value }) => {
  const changed: Record<string, unknown> = {};
  for (const key in value) {
    const k = key as keyof typeof value;
    const original = salon?.[k] ?? "";
    if (value[k] !== original) {
      changed[k] = value[k] === "" ? null : value[k];
    }
  }

  if (Object.keys(changed).length === 0) {
    toast.info("No changes to save");
    return;
  }

  mutate(changed, {
    onSuccess: () => {
      toast.success("Salon updated successfully");
    },
    onError: () => {
      toast.error("Failed to update salon");
    },
  });
},
	});

	React.useEffect(() => {
  if (salon) {
    form.reset({
      name: salon.name,
      description: salon.description ?? "",
      city: salon.city ?? "",
      address: salon.address ?? "",
      phone: salon.phone ?? "",
    });
  }
}, [salon]);

	return (
		<Card className="w-full sm:max-w-md">
			<CardHeader>
				<CardTitle>Edit Salon</CardTitle>
				<CardDescription>Update your salon's details.</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id="salon-edit-form"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}>
					<FieldGroup>
						<form.Field
							name="name"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Salon Name</FieldLabel>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>

						<form.Field
							name="description"
							children={(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Description</FieldLabel>
									<InputGroup>
										<InputGroupTextarea
											id={field.name}
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											rows={4}
											className="min-h-20 resize-none"
										/>
										<InputGroupAddon align="block-end">
											<InputGroupText className="tabular-nums">
												{field.state.value?.length ?? 0}/200 characters
											</InputGroupText>
										</InputGroupAddon>
									</InputGroup>
								</Field>
							)}
						/>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="city"
								children={(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>City</FieldLabel>
										<Input
											id={field.name}
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</Field>
								)}
							/>
							<form.Field
								name="phone"
								children={(field) => (
									<Field>
										<FieldLabel htmlFor={field.name}>Phone</FieldLabel>
										<Input
											id={field.name}
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</Field>
								)}
							/>
						</div>

						<form.Field
							name="address"
							children={(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Address</FieldLabel>
									<Input
										id={field.name}
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</Field>
							)}
						/>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter>
				<Field orientation="horizontal">
					<Button type="button" variant="outline" onClick={() => form.reset()}>
						Cancel
					</Button>
					<Button type="submit" form="salon-edit-form" disabled={isPending}>
						{isPending ? <Spinner /> : "Update Salons"}
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
}
