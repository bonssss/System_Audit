import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const scanIncludes = {
      project: true,
      statistics: true,
      languages: {
        orderBy: { linesOfCode: 'desc' as const },
      },
      dependencies: true,
      issues: {
        orderBy: [{ severity: 'asc' as const }, { createdAt: 'desc' as const }],
      },
      files: true,
      reports: {
        select: { id: true, format: true, createdAt: true },
      },
    };

    let scan = await db.scan.findUnique({
      where: { id },
      include: scanIncludes,
    });

    // If not found by scan ID, check if id is a project ID and load its latest scan
    if (!scan) {
      scan = await db.scan.findFirst({
        where: { projectId: id },
        orderBy: { createdAt: 'desc' },
        include: scanIncludes,
      });
    }

    if (!scan) {
      return NextResponse.json({ success: false, error: 'Scan not found' }, { status: 404 });
    }

    // Verify ownership
    if (user.role !== 'ADMIN' && scan.project.userId && scan.project.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden: Access denied to this scan' }, { status: 403 });
    }

    // Parse remediationJson
    const formattedIssues = scan.issues.map((i) => ({
      ...i,
      remediation: i.remediationJson ? JSON.parse(i.remediationJson) : null,
      location: {
        filePath: i.filePath,
        startLine: i.startLine,
        endLine: i.endLine,
        snippet: i.snippet,
      },
    }));

    const formattedDeps = scan.dependencies.map((d) => ({
      ...d,
      vulnerabilities: d.vulnerabilitiesJson ? JSON.parse(d.vulnerabilitiesJson) : [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...scan,
        issues: formattedIssues,
        dependencies: formattedDeps,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
