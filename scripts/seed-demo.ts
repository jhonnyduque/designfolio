/**
 * Datos de demostración desde la línea de comandos.
 *
 *   npx tsx --env-file=.env.local scripts/seed-demo.ts
 *   npx tsx --env-file=.env.local scripts/seed-demo.ts --remove
 *
 * La lógica vive en lib/demo/seed.ts, que comparte con el panel de la fundadora.
 */
import { borrarDemo, crearDemo } from "../lib/demo/seed"
import { getPool } from "../lib/db/client"

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.DEMO_EN_PRODUCCION !== "si") {
    console.error("Abortado: este script no debe ejecutarse en producción sin querer.")
    console.error("Si de verdad quieres datos de demostración ahí, usa el panel o DEMO_EN_PRODUCCION=si")
    process.exit(1)
  }

  if (process.argv.includes("--remove")) await borrarDemo()
  else {
    await crearDemo()
    console.log("\nListo. Para deshacerlo:  npx tsx --env-file=.env.local scripts/seed-demo.ts --remove")
  }

  await getPool().end()
}

main().catch(async (error) => {
  console.error("Falló:", error instanceof Error ? error.message : error)
  process.exit(1)
})
