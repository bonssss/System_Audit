import { NextRequest } from 'next/server';
import { subscribeToScanProgress } from '@/lib/scanner-service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = (data: any) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  const unsubscribe = subscribeToScanProgress(id, (progress) => {
    sendEvent(progress);
    if (progress.percent >= 100) {
      setTimeout(() => {
        writer.close();
      }, 1000);
    }
  });

  req.signal.addEventListener('abort', () => {
    unsubscribe();
    writer.close();
  });

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
