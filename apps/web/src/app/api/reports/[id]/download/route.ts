import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { generateInteractiveHtmlReport, generatePrintablePdfHtml, generateCsvReport } from '@ai-scanner/reports';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const format = (req.nextUrl.searchParams.get('format') || 'HTML').toUpperCase();

    // Find report by scanId or reportId
    let report = await db.report.findFirst({
      where: {
        OR: [{ id }, { scanId: id, format }],
      },
      include: {
        scan: {
          include: { project: true },
        },
      },
    });

    let content = report?.content;
    let projectName = report?.scan?.project?.name || 'Project';

    // If report record not found, load scan and generate content dynamically
    if (!content) {
      const scan = await db.scan.findFirst({
        where: {
          OR: [{ id }, { projectId: id }],
        },
        include: {
          project: true,
          statistics: true,
          languages: true,
          dependencies: true,
          issues: true,
        },
      });

      if (!scan) {
        return NextResponse.json({ success: false, error: 'Scan or Report not found' }, { status: 404 });
      }

      if (user.role !== 'ADMIN' && scan.project.userId && scan.project.userId !== user.id) {
        return NextResponse.json({ success: false, error: 'Forbidden: Access denied to this report' }, { status: 403 });
      }

      projectName = scan.project.name;

      const formattedScanResult: any = {
        id: scan.id,
        projectId: scan.projectId,
        scanDate: scan.createdAt.toISOString(),
        status: scan.status,
        durationMs: scan.durationMs,
        scores: {
          overall: scan.overallScore,
          grade: scan.grade,
          security: scan.securityScore,
          quality: scan.qualityScore,
          performance: scan.perfScore,
          architecture: scan.archScore,
          maintainability: scan.maintainabilityScore,
          documentation: scan.docScore,
          testing: scan.testScore,
        },
        metrics: {
          totalFiles: scan.statistics?.totalFiles || 0,
          totalLines: scan.statistics?.totalLines || 0,
          codeLines: scan.statistics?.codeLines || 0,
          blankLines: scan.statistics?.blankLines || 0,
          commentLines: scan.statistics?.commentLines || 0,
          commentPercentage: scan.statistics?.commentPercentage || 0,
        },
        languages: scan.languages || [],
        issues: (scan.issues || []).map((i) => ({
          ...i,
          remediation: i.remediationJson ? JSON.parse(i.remediationJson) : null,
          location: {
            filePath: i.filePath,
            startLine: i.startLine,
            endLine: i.endLine,
            snippet: i.snippet,
          },
        })),
        dependencies: scan.dependencies || [],
        createdAt: scan.createdAt.toISOString(),
      };

      if (format === 'HTML') {
        content = generateInteractiveHtmlReport(formattedScanResult, projectName);
      } else if (format === 'PDF') {
        content = generatePrintablePdfHtml(formattedScanResult, projectName);
      } else if (format === 'JSON') {
        content = JSON.stringify(formattedScanResult, null, 2);
      } else if (format === 'CSV') {
        content = generateCsvReport(formattedScanResult);
      } else {
        content = generateInteractiveHtmlReport(formattedScanResult, projectName);
      }
    } else {
      if (user.role !== 'ADMIN' && report?.scan.project.userId && report?.scan.project.userId !== user.id) {
        return NextResponse.json({ success: false, error: 'Forbidden: Access denied to this report' }, { status: 403 });
      }
    }

    const safeProjectName = projectName.replace(/[^a-zA-Z0-9_-]/g, '_');

    let contentType = 'text/html';
    let fileExt = 'html';

    if (format === 'PDF') {
      contentType = 'text/html'; // Printable HTML report
      fileExt = 'pdf.html';
    } else if (format === 'JSON') {
      contentType = 'application/json';
      fileExt = 'json';
    } else if (format === 'CSV') {
      contentType = 'text/csv';
      fileExt = 'csv';
    }

    return new Response(content || '', {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeProjectName}-Audit-Report.${fileExt}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
