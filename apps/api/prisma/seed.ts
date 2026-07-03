import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const types = [
    { name: 'Data Structures & Algorithms', slug: 'dsa', iconName: 'coding' },
    { name: 'Backend Development', slug: 'backend', iconName: 'server' },
    { name: 'System Design', slug: 'system-design', iconName: 'architecture' },
    { name: 'Behavioral', slug: 'behavioral', iconName: 'chat' },
  ];

  for (const type of types) {
    await prisma.interviewType.upsert({
      where: { slug: type.slug },
      update: { name: type.name, iconName: type.iconName },
      create: type,
    });
  }

  console.log('Seeded interview types');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
