import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { executeProjectScan, extractZipFiles } from '@/lib/scanner-service';
import { downloadGitRepository } from '@/lib/git-downloader';
import { SAMPLE_PROJECTS } from '@/lib/sample-projects';
import { getCurrentUser } from '@/lib/auth';
import { ProjectFileEntry } from '@ai-scanner/scanner-core';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const contentType = req.headers.get('content-type') || '';

    let projectId = '';
    let files: ProjectFileEntry[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      projectId = (formData.get('projectId') as string) || '';
      const projectName = (formData.get('projectName') as string) || 'Uploaded Project';
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'No ZIP archive selected' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      files = await extractZipFiles(buffer);

      if (files.length === 0) {
        return NextResponse.json({ success: false, error: 'ZIP archive contains no supported code files' }, { status: 400 });
      }

      // If projectId not provided, create project
      if (!projectId) {
        const proj = await db.project.create({
          data: {
            name: projectName,
            sourceType: 'ZIP_UPLOAD',
            userId: user?.id || null,
          },
        });
        projectId = proj.id;
      }
    } else {
      const body = await req.json();
      projectId = body.projectId;
      const gitUrl = body.gitUrl;
      const projectName = body.projectName;
      const sampleId = body.sampleId;

      if (gitUrl) {
        // Handle Git repository URL
        const gitResult = await downloadGitRepository(gitUrl);
        files = gitResult.files;

        if (files.length === 0) {
          return NextResponse.json({ success: false, error: 'No code files found in repository' }, { status: 400 });
        }

        if (!projectId) {
          const proj = await db.project.create({
            data: {
              name: projectName || gitResult.repoName,
              repositoryUrl: gitUrl,
              defaultBranch: gitResult.defaultBranch,
              sourceType: 'GITHUB',
              userId: user?.id || null,
            },
          });
          projectId = proj.id;
        }
      } else if (sampleId) {
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
              userId: user?.id || null,
            },
          });
          projectId = proj.id;
        }

        files = sample.files;
      } else if (body.files && Array.isArray(body.files)) {
        files = body.files;
        if (!projectId) {
          const proj = await db.project.create({
            data: {
              name: projectName || 'AST Sandbox Code',
              sourceType: 'LOCAL',
              userId: user?.id || null,
            },
          });
          projectId = proj.id;
        }
      }
    }

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Could not create or locate project' }, { status: 400 });
    }

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided for scan' }, { status: 400 });
    }

    // Launch scan
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
    return NextResponse.json({ success: false, error: err.message || 'Scan execution failed' }, { status: 500 });
  }
}
