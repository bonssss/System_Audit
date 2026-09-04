import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const projectFilter = { userId: user.id };

    const totalProjects = await db.project.count({ where: projectFilter });
    const totalScans = await db.scan.count({
      where: { project: projectFilter },
    });
    const totalIssues = await db.issue.count({
      where: { scan: { project: projectFilter } },
    });
    const criticalIssues = await db.issue.count({
      where: { severity: 'CRITICAL', scan: { project: projectFilter } },
    });
    const highIssues = await db.issue.count({
      where: { severity: 'HIGH', scan: { project: projectFilter } },
    });
    const mediumIssues = await db.issue.count({
      where: { severity: 'MEDIUM', scan: { project: projectFilter } },
    });

    const recentScans = await db.scan.findMany({
      where: { project: projectFilter },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        project: true,
        issues: { select: { severity: true } },
      },
    });

    const completedScans = await db.scan.findMany({
      where: { status: 'COMPLETED', project: projectFilter },
      select: {
        overallScore: true,
        securityScore: true,
        qualityScore: true,
        perfScore: true,
        archScore: true,
        maintainabilityScore: true,
        docScore: true,
        testScore: true,
      },
    });

    let avgScores = {
      overall: 0,
      grade: 'N/A',
      security: 0,
      quality: 0,
      performance: 0,
      architecture: 0,
      maintainability: 0,
      documentation: 0,
      testing: 0,
    };

    if (completedScans.length > 0) {
      const count = completedScans.length;
      const sum = completedScans.reduce(
        (acc, s) => ({
          overall: acc.overall + s.overallScore,
          security: acc.security + s.securityScore,
          quality: acc.quality + s.qualityScore,
          performance: acc.performance + s.perfScore,
          architecture: acc.architecture + s.archScore,
          maintainability: acc.maintainability + s.maintainabilityScore,
          documentation: acc.documentation + s.docScore,
          testing: acc.testing + s.testScore,
        }),
        { overall: 0, security: 0, quality: 0, performance: 0, architecture: 0, maintainability: 0, documentation: 0, testing: 0 }
      );

      const overall = Math.round(sum.overall / count);
      let grade = 'F';
      if (overall >= 90) grade = 'A+';
      else if (overall >= 80) grade = 'A';
      else if (overall >= 70) grade = 'B';
      else if (overall >= 60) grade = 'C';
      else if (overall >= 50) grade = 'D';

      avgScores = {
        overall,
        grade,
        security: Math.round(sum.security / count),
        quality: Math.round(sum.quality / count),
        performance: Math.round(sum.performance / count),
        architecture: Math.round(sum.architecture / count),
        maintainability: Math.round(sum.maintainability / count),
        documentation: Math.round(sum.documentation / count),
        testing: Math.round(sum.testing / count),
      };
    }

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
        averageScores: avgScores,
        recentScans: formattedRecent,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
