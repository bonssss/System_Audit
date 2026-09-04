import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const scanId = req.nextUrl.searchParams.get('scanId');
    const severity = req.nextUrl.searchParams.get('severity');
    const category = req.nextUrl.searchParams.get('category');
    const status = req.nextUrl.searchParams.get('status');

    const projectFilter = { userId: user.id };
    const where: any = {
      scan: {
        project: projectFilter,
      },
    };

    if (scanId) where.scanId = scanId;
    if (severity && severity !== 'ALL') where.severity = severity;
    if (category && category !== 'ALL') where.category = category;
    if (status && status !== 'ALL') where.status = status;

    const issues = await db.issue.findMany({
      where,
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
      take: 100,
    });

    const formatted = issues.map((i) => ({
      ...i,
      remediation: i.remediationJson ? JSON.parse(i.remediationJson) : null,
      location: {
        filePath: i.filePath,
        startLine: i.startLine,
        endLine: i.endLine,
        snippet: i.snippet,
      },
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
