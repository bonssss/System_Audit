import { ArchitectureAnalysis, ArchitectureEdge, ArchitectureNode, ScanIssue } from '@ai-scanner/shared';
import { ProjectFileEntry } from './statistics';
import { parseFileStructure } from '@ai-scanner/parser';

export interface ArchitectureAnalysisResult {
  architecture: ArchitectureAnalysis;
  issues: ScanIssue[];
}

export function analyzeArchitecture(files: ProjectFileEntry[]): ArchitectureAnalysisResult {
  const issues: ScanIssue[] = [];
  const nodeMap = new Map<string, ArchitectureNode>();
  const edges: ArchitectureEdge[] = [];
  const adjList = new Map<string, Set<string>>();

  // Extract nodes and imports
  for (const file of files) {
    if (file.path.endsWith('.json') || file.path.endsWith('.lock') || file.path.endsWith('.md')) {
      continue;
    }

    const structure = parseFileStructure(file.content, file.path);
    const modId = file.path;

    if (!nodeMap.has(modId)) {
      nodeMap.set(modId, {
        id: modId,
        label: modId.split(/[/\\]/).pop() || modId,
        type: 'file',
        inDegree: 0,
        outDegree: 0,
      });
      adjList.set(modId, new Set());
    }

    for (const imp of structure.imports) {
      // Resolve relative import to matching file
      if (imp.moduleSpecifier.startsWith('.')) {
        const dir = file.path.substring(0, file.path.lastIndexOf('/'));
        let targetNorm = `${dir}/${imp.moduleSpecifier.replace(/^\.\//, '')}`;
        // Match with known files
        const matched = files.find((f) => f.path.startsWith(targetNorm) || f.path === `${targetNorm}.ts` || f.path === `${targetNorm}.js` || f.path === `${targetNorm}.tsx`);
        const targetId = matched ? matched.path : targetNorm;

        if (!nodeMap.has(targetId)) {
          nodeMap.set(targetId, {
            id: targetId,
            label: targetId.split(/[/\\]/).pop() || targetId,
            type: 'module',
            inDegree: 0,
            outDegree: 0,
          });
          adjList.set(targetId, new Set());
        }

        edges.push({
          source: modId,
          target: targetId,
          weight: 1,
          type: 'import',
        });

        adjList.get(modId)?.add(targetId);
      }
    }
  }

  // Update in/out degrees
  for (const edge of edges) {
    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);
    if (src) src.outDegree += 1;
    if (tgt) tgt.inDegree += 1;
  }

  // Cycle detection (Tarjan or simple DFS)
  const circularDependencies: string[][] = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];

  function dfsDetectCycle(u: string) {
    visited.add(u);
    recStack.add(u);
    path.push(u);

    const neighbors = adjList.get(u) || new Set();
    for (const v of neighbors) {
      if (!visited.has(v)) {
        dfsDetectCycle(v);
      } else if (recStack.has(v)) {
        const cycleStartIndex = path.indexOf(v);
        if (cycleStartIndex !== -1) {
          const cycle = path.slice(cycleStartIndex).concat(v);
          circularDependencies.push(cycle);
        }
      }
    }

    path.pop();
    recStack.delete(u);
  }

  for (const nodeId of nodeMap.keys()) {
    if (!visited.has(nodeId)) {
      dfsDetectCycle(nodeId);
    }
  }

  // Generate circular dependency issues
  for (const cycle of circularDependencies) {
    const from = cycle[0];
    const to = cycle[1] || cycle[0];
    issues.push({
      id: `arch-circ-${from}-${to}`,
      ruleId: 'ARCH-CIRCULAR-001',
      title: `Circular Dependency Detected: ${cycle.map((p) => p.split(/[/\\]/).pop()).join(' ➔ ')}`,
      description: `Circular reference loop found across ${cycle.length - 1} modules, risking runtime undefined exports and tight coupling.`,
      category: 'ARCHITECTURE',
      severity: 'HIGH',
      location: { filePath: from, startLine: 1, endLine: 1 },
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    });

    // Mark edges as circular
    for (const edge of edges) {
      if (cycle.includes(edge.source) && cycle.includes(edge.target)) {
        edge.isCircular = true;
      }
    }
  }

  // Check layer violations
  const layerViolations: { from: string; to: string; reason: string }[] = [];
  for (const edge of edges) {
    const src = edge.source.toLowerCase();
    const tgt = edge.target.toLowerCase();

    // Domain/Core importing Controller/UI
    if ((src.includes('domain') || src.includes('entity') || src.includes('model')) && (tgt.includes('controller') || tgt.includes('view') || tgt.includes('component'))) {
      const reason = 'Core domain/entity layer directly imports higher-level presentation/controller layer.';
      layerViolations.push({ from: edge.source, to: edge.target, reason });
      issues.push({
        id: `arch-layer-${edge.source}`,
        ruleId: 'ARCH-LAYER-001',
        title: 'Architectural Layer Boundary Inversion Violation',
        description: reason,
        category: 'ARCHITECTURE',
        severity: 'MEDIUM',
        location: { filePath: edge.source, startLine: 1, endLine: 1 },
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      });
    }
  }

  const nodes = Array.from(nodeMap.values()).slice(0, 50); // Top 50 nodes for visual clarity
  const couplingScore = Math.max(0, 100 - circularDependencies.length * 15 - layerViolations.length * 10);
  const cohesionScore = Math.max(0, Math.min(100, Math.round(100 - (edges.length / Math.max(1, nodes.length)) * 5)));

  return {
    architecture: {
      nodes,
      edges: edges.slice(0, 80),
      circularDependencies,
      layerViolations,
      packageCouplingScore: couplingScore,
      cohesionScore,
    },
    issues,
  };
}
