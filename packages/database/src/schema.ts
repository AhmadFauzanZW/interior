import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("categories_slug_idx").on(t.slug)]
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .references(() => categories.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    basePrice: decimal("base_price", { precision: 12, scale: 2 }).notNull(),
    glbUrl: text("glb_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    dimensions: jsonb("dimensions").$type<{ width: number; height: number; depth: number }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("products_category_idx").on(t.categoryId)]
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    colorHex: varchar("color_hex", { length: 7 }),
    materialType: varchar("material_type", { length: 50 }),
    additionalPrice: decimal("additional_price", { precision: 12, scale: 2 }).default("0"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("variants_product_idx").on(t.productId)]
);

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));
