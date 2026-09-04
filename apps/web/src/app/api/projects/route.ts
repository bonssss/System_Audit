import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CreateProjectSchema } from '@ai-scanner/shared';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const where = { userId: user.id };

    const projects = await db.project.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            issues: {
              select: { severity: true },
            },
          },
        },
      },
    });

    const formatted = projects.map((p) => {
      const latestScan = p.scans[0];
      const issues = latestScan?.issues || [];
      const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
      const highCount = issues.filter((i) => i.severity === 'HIGH').length;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        repositoryUrl: p.repositoryUrl,
        branch: p.defaultBranch,
        sourceType: p.sourceType,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        lastScanDate: latestScan?.createdAt.toISOString() || null,
        latestScore: p.latestScore,
        latestGrade: p.latestGrade,
        scansCount: p.scans.length,
        criticalIssuesCount: criticalCount,
        highIssuesCount: highCount,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = CreateProjectSchema.parse(body);

    const project = await db.project.create({
      data: {
        name: validated.name,
        description: validated.description,
        repositoryUrl: validated.repositoryUrl || null,
        defaultBranch: validated.branch,
        sourceType: validated.sourceType,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

