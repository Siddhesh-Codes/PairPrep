import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      profile: true,
      interests: true,
      availability: true,
    },
  });

  console.log('--- USER DIAGNOSTICS ---');
  for (const user of users) {
    console.log(`User: ${user.displayName} (${user.email})`);
    console.log(`- Profile Complete: ${user.profile?.profileComplete}`);
    console.log(`- Bio: "${user.profile?.bio}" (Length: ${user.profile?.bio?.length || 0})`);
    console.log(`- Experience Level: ${user.profile?.experienceLevel}`);
    console.log(`- Interests Count: ${user.interests.length}`);
    console.log(`- Availability Count: ${user.availability.length}`);
    console.log('------------------------');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
