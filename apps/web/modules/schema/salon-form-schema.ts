import {z} from "zod"
export const formSchema = z.object({
  name: z
    .string()
    .min(2, "Salon name must be at least 2 characters.")
    .max(50, "Salon name must be at most 50 characters."),
  description: z
    .string()
    .max(200, "Description must be at most 200 characters.")
  ,
  city: z
    .string()
    .max(50, "City must be at most 50 characters.")
  ,
  address: z
    .string()
    .max(100, "Address must be at most 100 characters.")
   ,
  phone: z
    .string()
    .max(20, "Phone must be at most 20 characters.")
   ,
})