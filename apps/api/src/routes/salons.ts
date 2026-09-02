import { Hono } from "hono"
import {  requireUser } from "../middleware/auth"

import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { getDb } from "../db";

import { and, eq } from "drizzle-orm";
import { deleteImageKitFile } from "../lib/imagekit-auth";
import { salonSchema } from "../schema/salon-schema";
import { salons } from "../db/schema";
// salons post api
const app = new Hono<{ Bindings: CloudflareBindings }>()
  .use("*", requireUser)
 
  .post("/",requireUser,zValidator("json", salonSchema),async(c)=>{
    const ownerId = c.get("userId")
  const db = getDb(c.env.DATABASE_URL)
  const {name,address,city,description,phone} = await c.req.valid("json")
  const data = await db.insert(salons).values({
    ownerId,
    name,
    description,
    address,
    city,
    phone
  })
  .returning()
  return c.json(data,201)
  })
// GET /  — list salons for the logged-in owner
.get("/", requireUser, async (c) => {
  const ownerId = c.get("userId")
  const db = getDb(c.env.DATABASE_URL)

  const data = await db
    .select()
    .from(salons)
    .where(eq(salons.ownerId, ownerId))

  return c.json(data)
})
// GET /:id — single salon (scoped to owner)
.get("/:id", requireUser, async (c) => {
  const ownerId = c.get("userId")
  const id = c.req.param("id")
  const db = getDb(c.env.DATABASE_URL)

  const [salon] = await db
    .select()
    .from(salons)
    .where(and(eq(salons.id, id), eq(salons.ownerId, ownerId)))

  if (!salon) {
    return c.json({ error: "Salon not found" }, 404)
  }

  return c.json(salon)
})
// PATCH /:id — update salon (partial)
.patch(
  "/:id",
  requireUser,
  zValidator("param", z.object({ id: z.string() })),
  zValidator("json", salonSchema.partial()),
  async (c) => {
    const ownerId = c.get("userId")
     const { id } = c.req.valid("param");
    const db = getDb(c.env.DATABASE_URL)
    const body = await c.req.valid("json")

    const [existing] = await db
      .select()
      .from(salons)
      .where(and(eq(salons.id, id), eq(salons.ownerId, ownerId)))

    if (!existing) {
      return c.json({ error: "Salon not found" }, 404)
    }

    const [data] = await db
      .update(salons)
      .set(body)
      .where(and(eq(salons.id, id), eq(salons.ownerId, ownerId)))
      .returning()

    return c.json(data, 200)
  }
)
  // DELETE /:id — delete salon
.delete("/:id",  zValidator("param", z.object({ id: z.string() })), requireUser, async (c) => {
  const ownerId = c.get("userId")
   const { id } = c.req.valid("param");
  const db = getDb(c.env.DATABASE_URL)

  const [existing] = await db
    .select()
    .from(salons)
    .where(and(eq(salons.id, id), eq(salons.ownerId, ownerId)))

  if (!existing) {
    return c.json({ error: "Salon not found" }, 404)
  }

  await db
    .delete(salons)
    .where(and(eq(salons.id, id), eq(salons.ownerId, ownerId)))

  return c.json({ success: true })
})
export default app