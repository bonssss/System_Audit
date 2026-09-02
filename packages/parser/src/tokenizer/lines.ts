import { LanguageMeta } from '@ai-scanner/shared';

export interface FileLineStats {
  totalLines: number;
  codeLines: number;
  blankLines: number;
  commentLines: number;
  commentPercentage: number;
  lines: string[];
}

export function analyzeLineMetrics(content: string, languageMeta: LanguageMeta | null): FileLineStats {
  const lines = content.split(/\r?\n/);
  const totalLines = lines.length;
  let blankLines = 0;
  let commentLines = 0;
  let inMultiLineComment = false;
  let currentMultiLineEnd = '';

  const singleComments = languageMeta?.singleLineComments || ['//', '#'];
  const multiComments = languageMeta?.multiLineComments || [['/*', '*/']];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      blankLines++;
      continue;
    }

    if (inMultiLineComment) {
      commentLines++;
      if (trimmed.includes(currentMultiLineEnd)) {
        inMultiLineComment = false;
        currentMultiLineEnd = '';
      }
      continue;
    }

    // Check start of multi-line comment
    let multiStarted = false;
    for (const [startToken, endToken] of multiComments) {
      if (trimmed.startsWith(startToken)) {
        commentLines++;
        if (!trimmed.endsWith(endToken) || trimmed === startToken) {
          inMultiLineComment = true;
          currentMultiLineEnd = endToken;
        }
        multiStarted = true;
        break;
      }
    }

    if (multiStarted) continue;

    // Check single-line comment
    let isSingleComment = false;
    for (const singleToken of singleComments) {
      if (trimmed.startsWith(singleToken)) {
        commentLines++;
        isSingleComment = true;
        break;
      }
    }

    if (isSingleComment) continue;
  }

  const codeLines = Math.max(0, totalLines - blankLines - commentLines);
  const commentPercentage = totalLines > 0 ? Math.round((commentLines / totalLines) * 100) : 0;

  return {
    totalLines,
    codeLines,
    blankLines,
    commentLines,
    commentPercentage,
    lines,
  };
}
