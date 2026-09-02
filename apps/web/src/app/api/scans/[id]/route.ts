import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const scan = await db.scan.findUnique({
      where: { id },
      include: {
        project: true,
        statistics: true,
        languages: {
          orderBy: { linesOfCode: 'desc' },
        },
        dependencies: true,
        issues: {
          orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
        },
        files: true,
        reports: {
          select: { id: true, format: true, createdAt: true },
        },
      },
    });

    if (!scan) {
      return NextResponse.json({ success: false, error: 'Scan not found' }, { status: 404 });
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
