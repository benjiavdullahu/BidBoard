import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const names = [
  'xQc', 'MrBeast', 'Elon Musk', 'PewDiePie', 'Ninja',
  'DrDisrespect', 'Pokimane', 'Ludwig', 'Asmongold', 'HasanAbi',
  'TimTheTatman', 'NICKMERCS', 'shroud', 'summit1g', 'Valkyrae'
]

async function main() {
  console.log('Seeding database...')

  // Clear existing entries
  await prisma.entry.deleteMany()

  // Create test entries
  const entries = []
  for (let i = 0; i < 15; i++) {
    const amount = Math.floor(Math.random() * 50000) + 1000 // $10 to $500
    entries.push({
      name: names[i % names.length],
      amount: amount * 100, // Convert to cents
      email: `test${i}@example.com`,
      paid: true,
      stripeSessionId: `test_session_${i}`,
    })
  }

  await prisma.entry.createMany({ data: entries })

  console.log(`Created ${entries.length} test entries`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 