import { useDb } from '../server/utils/db'
import { prompts } from '../server/database/schema'
import { eq } from 'drizzle-orm'

async function checkPrompt() {
  const db = useDb()
  const id = '267722617300062200' 
  console.log(`Checking Prompt ID: ${id}`)
  
  // Need to cast string ID to BigInt for comparison if driver returns BigInt, 
  // but schema says mode: 'bigint', so drizzle expects BigInt or string?
  // Usually with BigInt mode, we should match against BigInt(id).
  
  /*
  const results = await db.select().from(prompts).where(eq(prompts.id, BigInt(id)))
  
  if (results.length === 0) {
    console.log('❌ Prompt NOT FOUND in database.')
  } else {
    const p = results[0]
    console.log('✅ Prompt FOUND:')
    console.log(` - ID: ${p.id}`)
    console.log(` - Title: ${p.title}`)
    console.log(` - Owner UserID: ${p.userId}`)
  }
  */
  
  console.log('Listing ALL prompts in DB:')
  const allPrompts = await db.select().from(prompts)
  console.log(`Total Prompts: ${allPrompts.length}`)
  allPrompts.forEach(p => {
     console.log(` - [${p.id}] ${p.title} (User: ${p.userId})`)
  })

  process.exit(0)
}

checkPrompt().catch(console.error)
