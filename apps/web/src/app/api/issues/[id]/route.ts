import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const existingIssue = await db.issue.findUnique({
      where: { id },
      include: {
        scan: {
          select: {
            project: { select: { userId: true } },
          },
        },
      },
    });

    if (!existingIssue) {
      return NextResponse.json({ success: false, error: 'Issue not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && existingIssue.scan.project.userId && existingIssue.scan.project.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden: Access denied to this issue' }, { status: 403 });
    }

    const issue = await db.issue.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: issue });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

