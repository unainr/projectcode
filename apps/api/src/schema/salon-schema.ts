import { z } from "zod"
export const salonSchema = z.object({
    name: z.string(),
    description: z.string(),
    city: z.string(),
    address: z.string(),
    phone: z.string()

})