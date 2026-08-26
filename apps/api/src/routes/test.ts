import { Hono } from "hono"
import {  requireUser } from "../middleware/auth"

import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { getDb } from "../db";
import { products } from "../db/schema";
import { eq } from "drizzle-orm";
import { deleteImageKitFile } from "../lib/imagekit-auth";
const createProductSchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().url(),
  imageFileId: z.string().min(1),
});
const app = new Hono<{ Bindings: CloudflareBindings }>()
  .use("*", requireUser)
  .post("/products", zValidator("json", createProductSchema), async (c) => {
    const db = getDb(c.env.DATABASE_URL)
    const body = c.req.valid("json");

    const [product] = await db.insert(products).values(body).returning();

    return c.json({product}, 201);
  })
  	.get("/",  async (c) => {
      const db = getDb(c.env.DATABASE_URL)
		const data = await db.select().from(products);
		if (!data) return c.json({ message: "Product not found" }, 404);
		return c.json(data);
	})
  .delete("/products/:id", async (c) => {
    const db = getDb(c.env.DATABASE_URL)
    const id = c.req.param("id");

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!product) {
      return c.json({ error: "Not found" }, 404);
    }

    // delete from ImageKit first — if this fails, don't orphan the DB row silently
    if (product.imageFileId) {
      try {
        await deleteImageKitFile({
          fileId: product.imageFileId,
          privateKey: c.env.IMAGEKIT_PRIVATE_KEY,
        });
      } catch (err) {
        console.error("ImageKit delete failed:", err);
        // decide: fail the whole request, or continue and just delete DB row anyway
        // return c.json({ message: "Failed to delete image" }, 500);
      }
    }

    await db.delete(products).where(eq(products.id, id));

    return c.json({ success: true });
  });
export default app