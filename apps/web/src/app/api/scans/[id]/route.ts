import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
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

    // Verify ownership only if the project is private to another user and user is not admin
    if (scan.project?.userId && user && user.role !== 'ADMIN' && scan.project.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden: Access denied to this scan' }, { status: 403 });
    }

    // Parse remediationJson and vulnerabilitiesJson safely
    const formattedIssues = scan.issues.map((i) => {
      let remediation = null;
      if (i.remediationJson) {
        try {
          remediation = typeof i.remediationJson === 'string' ? JSON.parse(i.remediationJson) : i.remediationJson;
        } catch {
          remediation = null;
        }
      }
      return {
        ...i,
        remediation,
        location: {
          filePath: i.filePath,
          startLine: i.startLine,
          endLine: i.endLine,
          snippet: i.snippet,
        },
      };
    });

    const formattedDeps = scan.dependencies.map((d) => {
      let vulnerabilities = [];
      if (d.vulnerabilitiesJson) {
        try {
          vulnerabilities = typeof d.vulnerabilitiesJson === 'string' ? JSON.parse(d.vulnerabilitiesJson) : d.vulnerabilitiesJson;
        } catch {
          vulnerabilities = [];
        }
      }
      return {
        ...d,
        vulnerabilities,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        ...scan,
        issues: formattedIssues,
        dependencies: formattedDeps,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
