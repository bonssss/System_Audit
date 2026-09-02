export interface CognitiveComplexityResult {
  cognitiveComplexity: number;
  maxNestingDepth: number;
  deepNestingLocations: {
    line: number;
    depth: number;
    snippet: string;
  }[];
}

export function calculateCognitiveComplexity(content: string): CognitiveComplexityResult {
  const lines = content.split(/\r?\n/);
  let totalScore = 0;
  let currentNesting = 0;
  let maxNesting = 0;
  const deepNestingLocations: { line: number; depth: number; snippet: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check opening & closing braces for C-style languages
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;

    // Check control flow statements that increment nesting
    const isControlFlow = /\b(if|else if|for|while|switch|catch|def|class|elif)\b/.test(trimmed);

    if (isControlFlow) {
      // Increments by 1 + currentNesting
      totalScore += 1 + currentNesting;
    }

    // Binary boolean operator sequences (&&, ||)
    const boolOps = (line.match(/(&&|\|\|)/g) || []).length;
    if (boolOps > 0) {
      totalScore += boolOps;
    }

    currentNesting = Math.max(0, currentNesting + openBraces - closeBraces);
    if (currentNesting > maxNesting) {
      maxNesting = currentNesting;
    }

    if (currentNesting >= 4 && isControlFlow) {
      deepNestingLocations.push({
        line: i + 1,
        depth: currentNesting,
        snippet: trimmed,
      });
    }
  }

  return {
    cognitiveComplexity: totalScore,
    maxNestingDepth: maxNesting,
    deepNestingLocations,
  };
}

export function calculateMaintainabilityIndex(
  linesOfCode: number,
  cyclomaticComplexity: number,
  commentPercentage: number
): number {
  if (linesOfCode <= 0) return 100;
  // Standard Coleman-Liau / SEI derivative formula
  // MI = 171 - 5.2 * ln(Halstead Volume approx) - 0.23 * (Cyclomatic) - 16.2 * ln(LOC) + 50 * sin(sqrt(2.4 * CommentPercentage))
  const loc = Math.max(1, linesOfCode);
  const cc = Math.max(1, cyclomaticComplexity);
  const cp = Math.min(100, Math.max(0, commentPercentage)) / 100;

  const rawMi = 171 - 16.2 * Math.log(loc) - 0.23 * cc + 10 * cp;
  const normalized = Math.max(0, Math.min(100, Math.round((rawMi * 100) / 171)));
  return normalized;
}
