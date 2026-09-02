import { PrismaClient } from '@prisma/client';
import { SAMPLE_PROJECTS } from '../src/lib/sample-projects';
import { executeProjectScan } from '../src/lib/scanner-service';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AI Project Scanner database...');

  // Create default admin / auditor user
  const user = await prisma.user.upsert({
    where: { email: 'auditor@aiprojectscanner.io' },
    update: {},
    create: {
      email: 'auditor@aiprojectscanner.io',
      name: 'Senior Principal Security Auditor',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log(`👤 Created or confirmed user: ${user.email}`);

  // Seed sample projects and run initial scans
  for (const sample of SAMPLE_PROJECTS) {
    const existing = await prisma.project.findFirst({
      where: { name: sample.name },
    });

    if (!existing) {
      console.log(`📦 Creating and scanning sample project: "${sample.name}"...`);
      const project = await prisma.project.create({
        data: {
          name: sample.name,
          description: sample.description,
          sourceType: sample.sourceType,
          userId: user.id,
          defaultBranch: 'main',
        },
      });

      const scanResult = await executeProjectScan(project.id, sample.files);
      console.log(`✅ Scan finished for "${sample.name}" with Grade ${scanResult.scores.grade} (${scanResult.scores.overall}/100) and ${scanResult.issues.length} findings.`);
    } else {
      console.log(`ℹ️ Project "${sample.name}" already exists.`);
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
