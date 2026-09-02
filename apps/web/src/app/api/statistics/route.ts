import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const totalProjects = await db.project.count();
    const totalScans = await db.scan.count();
    const totalIssues = await db.issue.count();
    const criticalIssues = await db.issue.count({ where: { severity: 'CRITICAL' } });
    const highIssues = await db.issue.count({ where: { severity: 'HIGH' } });
    const mediumIssues = await db.issue.count({ where: { severity: 'MEDIUM' } });

    const recentScans = await db.scan.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        project: true,
        issues: { select: { severity: true } },
      },
    });

    const formattedRecent = recentScans.map((s) => ({
      id: s.id,
      projectId: s.projectId,
      projectName: s.project.name,
      overallScore: s.overallScore,
      grade: s.grade,
      status: s.status,
      durationMs: s.durationMs,
      issuesCount: s.issues.length,
      criticalCount: s.issues.filter((i) => i.severity === 'CRITICAL').length,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalProjects,
        totalScans,
        totalIssues,
        criticalIssues,
        highIssues,
        mediumIssues,
        recentScans: formattedRecent,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
