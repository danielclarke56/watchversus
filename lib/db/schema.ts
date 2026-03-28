import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const photos = pgTable(
  'photos',
  {
    id: text('id').primaryKey(),
    watchId: text('watch_id').notNull(),
    userId: text('user_id').notNull(),
    userName: text('user_name').notNull(),
    url: text('url').notNull(),
    caption: text('caption'),
    brandName: text('brand_name'),
    modelName: text('model_name'),
    referenceNumber: text('reference_number'),
    movement: text('movement'),
    caseSize: text('case_size'),
    wristSize: text('wrist_size'),
    estimatedPrice: text('estimated_price'),
    productionYear: text('production_year'),
    status: text('status').default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
    createdAt: timestamp('created_at')
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    watchIdIdx: index('photos_watch_id_idx').on(table.watchId),
    userIdIdx: index('photos_user_id_idx').on(table.userId),
    statusIdx: index('photos_status_idx').on(table.status),
    createdAtIdx: index('photos_created_at_idx').on(table.createdAt),
  })
)

export type Photo = typeof photos.$inferSelect
export type NewPhoto = typeof photos.$inferInsert
