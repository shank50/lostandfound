import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  type: text("type", { enum: ["lost", "found"] }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrls: jsonb("image_urls").$type<string[]>().default([]).notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  secret: text("secret"),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

const emptyToUndefined = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? undefined : val;

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
}).extend({
  type: z.enum(["lost", "found"]),
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  imageUrls: z.array(z.string().url()).max(5, "Maximum 5 images allowed").default([]),
  contactEmail: z.preprocess(
    emptyToUndefined,
    z.string().email("Invalid email address").optional()
  ),
  contactPhone: z.preprocess(
    emptyToUndefined,
    z.string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number is too long")
      .regex(/^[\d\s+()-]+$/, "Phone number can only contain digits, spaces, +, -, and ()")
      .optional()
  ),
  secret: z.preprocess(
    emptyToUndefined,
    z.string().min(4, "Secret must be at least 4 characters").max(50, "Secret must be less than 50 characters")
  ),
}).refine(
  (data) => {
    // Secret now required for both lost and found
    return !!data.secret;
  },
  {
    message: "Secret password is required",
    path: ["secret"],
  }
);

export const markFoundSchema = z.object({
  id: z.number(),
  secret: z.string().min(1, "Secret is required"),
});

export const markReturnedSchema = z.object({
  id: z.number(),
  secret: z.string().min(1, "Secret is required"),
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type PostWithoutSecrets = Omit<Post, 'secret'>;
export type MarkFoundRequest = z.infer<typeof markFoundSchema>;
export type MarkReturnedRequest = z.infer<typeof markReturnedSchema>;
