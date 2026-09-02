export interface CodeSymbol {
  name: string;
  kind: 'class' | 'interface' | 'function' | 'method' | 'enum' | 'struct';
  line: number;
  endLine?: number;
  length?: number;
}

export interface ImportStatement {
  moduleSpecifier: string;
  importedSymbols: string[];
  isDefault: boolean;
  line: number;
}

export interface FileStructure {
  symbols: CodeSymbol[];
  imports: ImportStatement[];
  exports: string[];
  hasAsyncOps: boolean;
}

export function parseFileStructure(content: string, filename: string): FileStructure {
  const symbols: CodeSymbol[] = [];
  const imports: ImportStatement[] = [];
  const exports: string[] = [];
  const lines = content.split(/\r?\n/);
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();

  // Pattern matchers per language family
  const classPattern = /(?:export\s+)?(?:abstract\s+)?class\s+([a-zA-Z0-9_$]+)/g;
  const interfacePattern = /(?:export\s+)?interface\s+([a-zA-Z0-9_$]+)/g;
  const functionPattern = /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)/g;
  const arrowFuncPattern = /(?:export\s+)?(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>/g;
  const pythonClassPattern = /^class\s+([a-zA-Z0-9_]+)/;
  const pythonDefPattern = /^(\s*)def\s+([a-zA-Z0-9_]+)\s*\(/;
  const goFuncPattern = /^func\s+(?:\([^)]+\)\s*)?([a-zA-Z0-9_]+)\s*\(/;
  const rustFnPattern = /(?:pub\s+)?fn\s+([a-zA-Z0-9_]+)\s*\(/;

  // Import patterns
  const esmImport = /import\s+(?:\{([^}]+)\}|([a-zA-Z0-9_$]+)|\*\s+as\s+([a-zA-Z0-9_$]+))\s+from\s+['"]([^'"]+)['"]/g;
  const commonJsRequire = /(?:const|let|var)\s+(?:\{([^}]+)\}|([a-zA-Z0-9_$]+))\s*=\s*require\(['"]([^'"]+)['"]\)/g;
  const pythonImport = /^(?:from\s+([a-zA-Z0-9_.]+)\s+import\s+([^#\n]+)|import\s+([a-zA-Z0-9_., ]+))/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // TypeScript / JS / Java / C# classes
    let match;
    while ((match = classPattern.exec(line)) !== null) {
      symbols.push({ name: match[1], kind: 'class', line: lineNum });
    }
    while ((match = interfacePattern.exec(line)) !== null) {
      symbols.push({ name: match[1], kind: 'interface', line: lineNum });
    }
    while ((match = functionPattern.exec(line)) !== null) {
      symbols.push({ name: match[1], kind: 'function', line: lineNum });
    }
    while ((match = arrowFuncPattern.exec(line)) !== null) {
      symbols.push({ name: match[1], kind: 'function', line: lineNum });
    }

    // Python
    if (ext === '.py') {
      const pyClass = line.match(pythonClassPattern);
      if (pyClass) {
        symbols.push({ name: pyClass[1], kind: 'class', line: lineNum });
      }
      const pyDef = line.match(pythonDefPattern);
      if (pyDef) {
        const isMethod = pyDef[1].length > 0;
        symbols.push({ name: pyDef[2], kind: isMethod ? 'method' : 'function', line: lineNum });
      }
      const pyImp = line.match(pythonImport);
      if (pyImp) {
        if (pyImp[1]) {
          imports.push({
            moduleSpecifier: pyImp[1],
            importedSymbols: pyImp[2].split(',').map((s) => s.trim()),
            isDefault: false,
            line: lineNum,
          });
        } else if (pyImp[3]) {
          imports.push({
            moduleSpecifier: pyImp[3].trim(),
            importedSymbols: [],
            isDefault: true,
            line: lineNum,
          });
        }
      }
    }

    // Go
    if (ext === '.go') {
      const goFunc = line.match(goFuncPattern);
      if (goFunc) {
        symbols.push({ name: goFunc[1], kind: 'function', line: lineNum });
      }
    }

    // Rust
    if (ext === '.rs') {
      const rsFn = line.match(rustFnPattern);
      if (rsFn) {
        symbols.push({ name: rsFn[1], kind: 'function', line: lineNum });
      }
    }

    // JS/TS Imports
    while ((match = esmImport.exec(line)) !== null) {
      const named = match[1] ? match[1].split(',').map((s) => s.trim()) : [];
      const defaultName = match[2] || match[3] || '';
      const mod = match[4];
      imports.push({
        moduleSpecifier: mod,
        importedSymbols: named.length > 0 ? named : (defaultName ? [defaultName] : []),
        isDefault: !!defaultName,
        line: lineNum,
      });
    }

    while ((match = commonJsRequire.exec(line)) !== null) {
      const named = match[1] ? match[1].split(',').map((s) => s.trim()) : [];
      const defaultName = match[2] || '';
      const mod = match[3];
      imports.push({
        moduleSpecifier: mod,
        importedSymbols: named.length > 0 ? named : (defaultName ? [defaultName] : []),
        isDefault: !!defaultName,
        line: lineNum,
      });
    }
  }

  const hasAsyncOps = /\b(async|await|Promise|then|catch|defer|go\s+[a-zA-Z0-9_]+)\b/.test(content);

  return {
    symbols,
    imports,
    exports,
    hasAsyncOps,
  };
}
