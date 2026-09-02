import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const format = (req.nextUrl.searchParams.get('format') || 'HTML').toUpperCase();

    // Find report by scanId or reportId
    const report = await db.report.findFirst({
      where: {
        OR: [{ id }, { scanId: id, format }],
      },
      include: {
        scan: {
          include: { project: true },
        },
      },
    });

    if (!report || !report.content) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    const projectName = report.scan.project.name.replace(/[^a-zA-Z0-9_-]/g, '_');

    let contentType = 'text/html';
    let fileExt = 'html';

    if (format === 'PDF') {
      contentType = 'text/html'; // PDF formatted HTML ready to print/save as PDF
      fileExt = 'pdf.html';
    } else if (format === 'JSON') {
      contentType = 'application/json';
      fileExt = 'json';
    } else if (format === 'CSV') {
      contentType = 'text/csv';
      fileExt = 'csv';
    }

    return new Response(report.content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${projectName}-Audit-Report.${fileExt}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
