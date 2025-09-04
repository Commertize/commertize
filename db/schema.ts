import { pgTable, text, timestamp, jsonb, pgEnum, uuid, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Market update types enum
export const marketUpdateTypeEnum = pgEnum('market_update_type', ['daily', 'weekly', 'monthly']);

// News article categories enum
export const newsArticleCategoryEnum = pgEnum('news_article_category', [
  'CRE', 'Tokenization', 'RWA', 'Crypto', 'Digital Assets', 'Regulation', 'Technology', 'Markets'
]);

// Workflow status enum for Commertizer X
export const workflowStatusEnum = pgEnum('workflow_status', [
  'pending', 'in_progress', 'completed', 'failed', 'paused'
]);

// Document processing status enum
export const documentStatusEnum = pgEnum('document_status', [
  'uploaded', 'processing', 'extracted', 'reconciled', 'validated', 'failed'
]);

// Market updates table
export const marketUpdates = pgTable('market_updates', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: marketUpdateTypeEnum('type').notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  sections: jsonb('sections').$type<Array<{
    heading: string;
    body: string;
    bullets?: string[];
    citations?: string[];
  }>>().notNull(),
  metrics: jsonb('metrics').$type<Record<string, number | string>>().notNull(),
  chart: jsonb('chart').$type<{
    labels: string[];
    series: Array<{
      name: string;
      data: number[];
    }>;
  }>(),
  tags: text('tags').array().notNull().default(['CRE', 'Tokenization', 'RWA']),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// AI News articles table
export const newsArticles = pgTable('news_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  summary: text('summary').notNull(),
  content: text('content').notNull(),
  category: newsArticleCategoryEnum('category').notNull(),
  tags: text('tags').array().notNull().default([]),
  imageUrl: text('image_url'),
  readTime: integer('read_time').notNull().default(5), // in minutes
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  aiGenerated: text('ai_generated').notNull().default('true'), // track if AI generated
});

// Users table (if not exists)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: text('email_verified'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Favorites table (existing)
export const favorites = pgTable('favorites', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  propertyId: text('property_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// LinkedIn contacts table for automation
export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  location: text('location'),
  profileUrl: text('profile_url').notNull().unique(),
  email: text('email'),
  phone: text('phone'),
  industry: text('industry'),
  connectionLevel: text('connection_level'),
  verified: text('verified').notNull().default('false'),
  summary: text('summary'),
  experience: text('experience'), // JSON string
  education: text('education'), // JSON string
  skills: text('skills'), // JSON string
  segment: text('segment'), // Owner/Sponsor, Broker/Agent, etc.
  priority: text('priority'), // High, Medium, Low
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Commertizer X Workflows table
export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'document_processing', 'deal_creation', 'investor_outreach', etc.
  status: workflowStatusEnum('status').notNull().default('pending'),
  userId: text('user_id').references(() => users.id),
  runeInsights: jsonb('rune_insights').$type<{
    strategy: string;
    recommendations: string[];
    confidence: number;
    dqi?: number;
  }>(),
  orchestrationSteps: jsonb('orchestration_steps').$type<Array<{
    step: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    result?: any;
    error?: string;
  }>>().notNull().default([]),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Document processing table for Commertizer X
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').references(() => workflows.id),
  userId: text('user_id').references(() => users.id),
  filename: text('filename').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  status: documentStatusEnum('status').notNull().default('uploaded'),
  extractedData: jsonb('extracted_data').$type<{
    totals?: Record<string, number>;
    rentRoll?: any[];
    debtTerms?: Record<string, any>;
    confidences?: Record<string, number>;
  }>(),
  reconciliation: jsonb('reconciliation').$type<{
    mapped: Record<string, any>;
    conflicts: any[];
    corrections: any[];
  }>(),
  dqiScore: integer('dqi_score'),
  processingLogs: text('processing_logs').array().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// CRE Deals orchestrated by Commertizer X
export const deals = pgTable('deals', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').references(() => workflows.id),
  documentId: uuid('document_id').references(() => documents.id),
  userId: text('user_id').references(() => users.id),
  name: text('name').notNull(),
  propertyType: text('property_type'),
  address: text('address'),
  stage: text('stage').notNull().default('Draft'), // Draft, Review, Live, Funded
  dqiScore: integer('dqi_score'),
  targetAmount: integer('target_amount'),
  currentProgress: integer('current_progress').default(0),
  financials: jsonb('financials').$type<{
    noi?: number;
    dscr?: number;
    egi?: number;
    opex?: number;
    debt?: Record<string, any>;
  }>(),
  tokenization: jsonb('tokenization').$type<{
    tokenSymbol?: string;
    totalSupply?: number;
    pricePerToken?: number;
    minimumInvestment?: number;
  }>(),
  runeAnalysis: jsonb('rune_analysis').$type<{
    strengths: string[];
    risks: string[];
    recommendations: string[];
    pillarScores: Record<string, number>;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  launchedAt: timestamp('launched_at'),
});

// Relations
export const marketUpdatesRelations = relations(marketUpdates, ({ many }) => ({
  // Future: comments, likes, etc.
}));

export const newsArticlesRelations = relations(newsArticles, ({ many }) => ({
  // Future: comments, likes, etc.
}));

export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(favorites),
  workflows: many(workflows),
  documents: many(documents),
  deals: many(deals),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
}));

// Commertizer X Relations
export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  user: one(users, {
    fields: [workflows.userId],
    references: [users.id],
  }),
  documents: many(documents),
  deals: many(deals),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  workflow: one(workflows, {
    fields: [documents.workflowId],
    references: [workflows.id],
  }),
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  deal: one(deals, {
    fields: [documents.id],
    references: [deals.documentId],
  }),
}));

export const dealsRelations = relations(deals, ({ one }) => ({
  workflow: one(workflows, {
    fields: [deals.workflowId],
    references: [workflows.id],
  }),
  document: one(documents, {
    fields: [deals.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [deals.userId],
    references: [users.id],
  }),
}));

// Types for TypeScript
export type MarketUpdate = typeof marketUpdates.$inferSelect;
export type NewMarketUpdate = typeof marketUpdates.$inferInsert;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type NewNewsArticle = typeof newsArticles.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;