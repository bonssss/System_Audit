import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Purging all dummy data from database...');
  
  await prisma.report.deleteMany({});
  await prisma.issue.deleteMany({});
  await prisma.dependency.deleteMany({});
  await prisma.fileRecord.deleteMany({});
  await prisma.languageMetric.deleteMany({});
  await prisma.statistics.deleteMany({});
  await prisma.scan.deleteMany({});
  await prisma.repository.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.apiKey.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Database is completely clean! Zero dummy records.');
}

cleanDatabase()
  .catch((e) => {
    console.error('Error cleaning database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
