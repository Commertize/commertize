import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Create the connection string
const connectionString = process.env.DATABASE_URL;

// Create the postgres connection
const client = postgres(connectionString);

// Create the drizzle instance
export const db = drizzle(client, { schema });

export * from "./schema";