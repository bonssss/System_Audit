export interface ComplexityResult {
  cyclomaticComplexity: number;
  decisionPointsCount: number;
  functionsCount: number;
  highComplexityFunctions: {
    name: string;
    line: number;
    complexity: number;
  }[];
}

const BRANCHING_PATTERNS = [
  /\bif\b\s*\(/g,
  /\belse\s+if\b\s*\(/g,
  /\bfor\b\s*\(/g,
  /\bwhile\b\s*\(/g,
  /\bcase\b\s+[^:]+:/g,
  /\bcatch\b\s*\(/g,
  /&&/g,
  /\|\|/g,
  /\?\?/g,
  /\?[^:]+:/g,
  /\belif\b/g, // Python
  /\bexcept\b/g, // Python
];

export function calculateCyclomaticComplexity(content: string): ComplexityResult {
  let complexity = 1; // Base complexity
  let decisionPoints = 0;

  for (const pattern of BRANCHING_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      decisionPoints += matches.length;
      complexity += matches.length;
    }
  }

  // Parse functions and their approximate local complexity
  const highComplexityFunctions: { name: string; line: number; complexity: number }[] = [];
  const lines = content.split(/\r?\n/);
  let functionsCount = 0;

  // Approximate function declaration matches
  const funcDeclPattern = /(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|def\s+([a-zA-Z0-9_]+)|public|private|protected|fn\s+([a-zA-Z0-9_]+)|func\s+(?:\([^)]+\)\s*)?([a-zA-Z0-9_]+))/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(funcDeclPattern);
    if (match) {
      functionsCount++;
      const funcName = match[1] || match[2] || match[3] || match[4] || match[5] || `anon_${i + 1}`;
      
      // Calculate local slice complexity (e.g. next 50 lines)
      const slice = lines.slice(i, Math.min(lines.length, i + 50)).join('\n');
      let localComp = 1;
      for (const p of BRANCHING_PATTERNS) {
        const localMatches = slice.match(p);
        if (localMatches) localComp += localMatches.length;
      }
      if (localComp > 10) {
        highComplexityFunctions.push({
          name: funcName,
          line: i + 1,
          complexity: localComp,
        });
      }
    }
  }

  return {
    cyclomaticComplexity: complexity,
    decisionPointsCount: decisionPoints,
    functionsCount: Math.max(1, functionsCount),
    highComplexityFunctions,
  };
}
