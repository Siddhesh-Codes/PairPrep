import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const matchRequests = await prisma.matchRequest.findMany({
    include: {
      requester: true,
      recipient: true,
    }
  });
  console.log('Match Requests:');
  for (const req of matchRequests) {
    console.log(`ID: ${req.id}`);
    console.log(`Requester: ${req.requester.displayName} (${req.requester.email})`);
    console.log(`Recipient: ${req.recipient.displayName} (${req.recipient.email})`);
    console.log(`Status: ${req.status}`);
    console.log(`Interview Type ID: ${req.interviewTypeId}`);
    console.log('---');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
