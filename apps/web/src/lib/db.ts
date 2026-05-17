import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@interior/database";

const connectionString = process.env.DATABASE_URL!;

const queryClient = postgres(connectionString, {
  max: 10,
  ssl: false,
  connect_timeout: 10,
  idle_timeout: 20,
});

export const db = drizzle(queryClient, { schema });
