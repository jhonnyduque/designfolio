import { getDb } from "../lib/db/client";
import { profiles } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = getDb();
  await db.update(profiles).set({ isFounder: true });
  console.log("Todos los usuarios ahora son fundadores localmente para testing.");
  process.exit(0);
}

main();
