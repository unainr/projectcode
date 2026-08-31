import { Hono } from "hono"
import {  requireUser } from "../middleware/auth"

import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { getDb } from "../db";

import { eq } from "drizzle-orm";
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
export default app