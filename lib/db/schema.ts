import { pgTable, text, timestamp, integer, index, unique } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const photos = pgTable(
  'photos',
  {
    id: text('id').primaryKey(),
    watchId: text('watch_id').notNull(),
    userId: text('user_id').notNull(),
    userName: text('user_name').notNull(),
    url: text('url').notNull(),
    thumbnailUrl: text('thumbnail_url'), // Optional: 600px wide thumbnail
    originalUrl: text('original_url'), // Preserved before first crop so admin can revert
    brandName: text('brand_name'),
    modelName: text('model_name'),
    referenceNumber: text('reference_number'),
    movement: text('movement'),
    caseSize: text('case_size'),
    wristSize: text('wrist_size'),
    estimatedPrice: text('estimated_price'),
    productionYear: text('production_year'),
    lugToLug: text('lug_to_lug'),
    betweenLugs: text('between_lugs'),
    thickness: text('thickness'),
    waterResistance: text('water_resistance'),
    // AI-detected visual characteristics (hidden from users, admin-editable)
    dialColor: text('dial_color'),
    bezelColor: text('bezel_color'),
    caseMaterial: text('case_material'),
    strapType: text('strap_type'),
    watchStyle: text('watch_style'),
    status: text('status').default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
    sortOrder: integer('sort_order').default(0).notNull(),
    slug: text('slug').unique(), // SEO-friendly: {brand}-{model}-{first8charsOfUUID}
    createdAt: timestamp('created_at')
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    watchIdIdx: index('photos_watch_id_idx').on(table.watchId),
    userIdIdx: index('photos_user_id_idx').on(table.userId),
    statusIdx: index('photos_status_idx').on(table.status),
    createdAtIdx: index('photos_created_at_idx').on(table.createdAt),
    slugIdx: index('photos_slug_idx').on(table.slug),
  })
)

export type Photo = typeof photos.$inferSelect
export type NewPhoto = typeof photos.$inferInsert

export const photoLikes = pgTable(
  'photo_likes',
  {
    id: text('id').primaryKey(),
    photoId: text('photo_id').notNull(),
    userId: text('user_id').notNull(),
    createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  },
  (table) => ({
    photoUserUnique: unique().on(table.photoId, table.userId),
    photoIdIdx: index('photo_likes_photo_id_idx').on(table.photoId),
    userIdIdx: index('photo_likes_user_id_idx').on(table.userId),
  })
)

export type PhotoLike = typeof photoLikes.$inferSelect

export const collections = pgTable(
  'collections',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  },
  (table) => ({
    userIdIdx: index('collections_user_id_idx').on(table.userId),
  })
)

export type Collection = typeof collections.$inferSelect

export const collectionItems = pgTable(
  'collection_items',
  {
    id: text('id').primaryKey(),
    collectionId: text('collection_id').notNull(),
    photoId: text('photo_id').notNull(),
    createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  },
  (table) => ({
    collectionPhotoUnique: unique().on(table.collectionId, table.photoId),
    collectionIdIdx: index('collection_items_collection_id_idx').on(table.collectionId),
    photoIdIdx: index('collection_items_photo_id_idx').on(table.photoId),
  })
)

export type CollectionItem = typeof collectionItems.$inferSelect
