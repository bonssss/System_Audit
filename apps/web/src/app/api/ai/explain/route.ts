import { NextRequest, NextResponse } from 'next/server';
import { AIEngine } from '@ai-scanner/ai';
import { ScanIssue } from '@ai-scanner/shared';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const issue = body.issue as ScanIssue;
    const fullFileSnippet = body.fullFileSnippet as string | undefined;

    const ai = new AIEngine({
      apiKey: process.env.OPENAI_API_KEY,
      provider: (process.env.AI_PROVIDER as any) || 'local',
    });

    const remediation = await ai.explainAndRemediate(issue, fullFileSnippet);
    return NextResponse.json({ success: true, data: remediation });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
