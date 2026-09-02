import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { executeProjectScan, extractZipFiles } from '@/lib/scanner-service';
import { SAMPLE_PROJECTS } from '@/lib/sample-projects';
import { ProjectFileEntry } from '@ai-scanner/scanner-core';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let projectId = '';
    let files: ProjectFileEntry[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      projectId = (formData.get('projectId') as string) || '';
      const projectName = (formData.get('projectName') as string) || 'Uploaded Project';
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
      }

      // If projectId not provided, create project
      if (!projectId) {
        const proj = await db.project.create({
          data: {
            name: projectName,
            sourceType: 'ZIP_UPLOAD',
          },
        });
        projectId = proj.id;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      files = await extractZipFiles(buffer);

      if (files.length === 0) {
        return NextResponse.json({ success: false, error: 'ZIP file contains no supported code files' }, { status: 400 });
      }
    } else {
      const body = await req.json();
      projectId = body.projectId;
      const sampleId = body.sampleId;

      if (sampleId) {
        const sample = SAMPLE_PROJECTS.find((s) => s.id === sampleId);
        if (!sample) {
          return NextResponse.json({ success: false, error: 'Sample project not found' }, { status: 404 });
        }

        if (!projectId) {
          const proj = await db.project.create({
            data: {
              name: sample.name,
              description: sample.description,
              sourceType: 'LOCAL',
            },
          });
          projectId = proj.id;
        }

        files = sample.files;
      } else if (body.files && Array.isArray(body.files)) {
        files = body.files;
      }
    }

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
    }

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided for scan' }, { status: 400 });
    }

    // Launch scan asynchronously or synchronously
    const scanResult = await executeProjectScan(projectId, files);

    return NextResponse.json({
      success: true,
      data: {
        scanId: scanResult.id,
        projectId,
        scores: scanResult.scores,
        metrics: scanResult.metrics,
        issuesCount: scanResult.issues.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
