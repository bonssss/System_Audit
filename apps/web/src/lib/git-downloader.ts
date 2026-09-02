import { ProjectFileEntry } from '@ai-scanner/scanner-core';
import { extractZipFiles } from './scanner-service';
import { logger } from './logger';

/**
 * Downloads and extracts source code files from a public Git repository URL
 */
export async function downloadGitRepository(gitUrl: string): Promise<{ files: ProjectFileEntry[]; defaultBranch: string; repoName: string }> {
  const cleanUrl = gitUrl.trim().replace(/\.git$/i, '').replace(/\/$/, '');
  
  // Extract repo name
  const segments = cleanUrl.split('/');
  const repoName = segments[segments.length - 1] || 'Git Project';
  const owner = segments[segments.length - 2] || '';

  logger.info({ cleanUrl, owner, repoName }, 'Fetching Git repository archive...');

  // Try downloading ZIP archive from main / master branch
  const branches = ['main', 'master', 'trunk', 'develop'];
  let zipBuffer: Buffer | null = null;
  let successfulBranch = 'main';

  for (const branch of branches) {
    let zipUrl = '';
    if (cleanUrl.includes('github.com')) {
      zipUrl = `https://github.com/${owner}/${repoName}/archive/refs/heads/${branch}.zip`;
    } else if (cleanUrl.includes('gitlab.com')) {
      zipUrl = `${cleanUrl}/-/archive/${branch}/${repoName}-${branch}.zip`;
    } else {
      zipUrl = `${cleanUrl}/archive/refs/heads/${branch}.zip`;
    }

    try {
      const res = await fetch(zipUrl, {
        headers: {
          'User-Agent': 'AI-Project-Scanner/1.0',
        },
      });

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        if (arrayBuf.byteLength > 100) {
          zipBuffer = Buffer.from(arrayBuf);
          successfulBranch = branch;
          break;
        }
      }
    } catch (err) {
      logger.warn({ branch, err }, 'Failed to fetch branch zip archive, trying next');
    }
  }

  if (!zipBuffer) {
    // If direct zip download fails, try GitHub API tree if it's GitHub
    if (cleanUrl.includes('github.com') && owner && repoName) {
      try {
        const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees/main?recursive=1`, {
          headers: { 'User-Agent': 'AI-Project-Scanner/1.0' },
        });
        if (treeRes.ok) {
          const treeData = await treeRes.json();
          const tree = treeData.tree || [];
          const files: ProjectFileEntry[] = [];

          for (const item of tree.slice(0, 50)) {
            if (item.type === 'blob' && !item.path.includes('.git/') && !item.path.includes('node_modules/')) {
              try {
                const rawRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repoName}/main/${item.path}`);
                if (rawRes.ok) {
                  const content = await rawRes.text();
                  files.push({
                    path: item.path,
                    content,
                    size: content.length,
                  });
                }
              } catch {}
            }
          }

          if (files.length > 0) {
            return { files, defaultBranch: 'main', repoName };
          }
        }
      } catch (apiErr) {
        logger.error({ apiErr }, 'GitHub API tree fetch failed');
      }
    }

    throw new Error(`Could not access repository at "${gitUrl}". Ensure it is public and contains a main or master branch.`);
  }

  const rawFiles = await extractZipFiles(zipBuffer);

  // Strip top-level archive directory prefix (e.g. "repo-main/src/..." -> "src/...")
  const files: ProjectFileEntry[] = rawFiles.map((f) => {
    const parts = f.path.split('/');
    const cleanedPath = parts.length > 1 ? parts.slice(1).join('/') : f.path;
    return {
      ...f,
      path: cleanedPath,
    };
  });

  return {
    files,
    defaultBranch: successfulBranch,
    repoName,
  };
}
