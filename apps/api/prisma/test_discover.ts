import { PrismaClient } from '@prisma/client';
import { DiscoveryService } from '../src/discovery/discovery.service';

const prisma = new PrismaClient();
const service = new DiscoveryService(prisma as any);

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    console.log(`Discovering for user: ${user.displayName} (ID: ${user.id})`);
    const results = await service.discover(user.id);
    console.log(`Results count: ${results.length}`);
    console.log(JSON.stringify(results, null, 2));
    console.log('===================================');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
