import { useDb } from '../server/utils/db'
import { tags, users } from '../server/database/schema'
import { eq } from 'drizzle-orm'

async function checkTags() {
  const db = useDb()
  console.log('Checking Users and Tags...')
  const allUsers = await db.select().from(users)
  console.log(`Found ${allUsers.length} users.`)

  for (const user of allUsers) {
    const userTags = await db.select().from(tags).where(eq(tags.userId, user.id))
    console.log(`User ${user.email} (ID: ${user.id}) has ${userTags.length} tags.`)
    if (userTags.length > 0) {
      console.log(' - Tags:', userTags.map(t => t.name).join(', '))
    }
  }

  const allTags = await db.select().from(tags)
  console.log(`Total tags in DB: ${allTags.length}`)
  if (allTags.length > 0) {
    console.log('Orphan tags details:', allTags.map(t => ({ id: t.id.toString(), name: t.name, userId: t.userId.toString() })))
  }
  process.exit(0)
}

checkTags().catch(console.error)
