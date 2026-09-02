import { DatabaseModel, ScanIssue } from '@ai-scanner/shared';
import { ProjectFileEntry } from './statistics';

export interface DatabaseAnalysisResult {
  models: DatabaseModel[];
  issues: ScanIssue[];
}

export function analyzeDatabase(files: ProjectFileEntry[]): DatabaseAnalysisResult {
  const models: DatabaseModel[] = [];
  const issues: ScanIssue[] = [];

  for (const file of files) {
    const baseName = file.path.split(/[/\\]/).pop() || '';

    // 1. Prisma schema
    if (baseName.endsWith('.prisma')) {
      const lines = file.content.split(/\r?\n/);
      let currentModel: DatabaseModel | null = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineNum = i + 1;

        if (line.startsWith('model ')) {
          const modelName = line.split(/\s+/)[1];
          currentModel = {
            name: modelName,
            filePath: file.path,
            fieldsCount: 0,
            indexes: [],
            missingIndexes: [],
            relationships: [],
          };
          models.push(currentModel);
          continue;
        }

        if (currentModel) {
          if (line === '}') {
            currentModel = null;
            continue;
          }

          if (line.startsWith('@@index') || line.startsWith('@@unique') || line.startsWith('@@id')) {
            currentModel.indexes.push(line);
          } else if (line && !line.startsWith('//') && !line.startsWith('@@')) {
            currentModel.fieldsCount++;
            // Check foreign keys without index (e.g. userId String)
            if (line.includes('Id ') && !line.includes('@id') && !line.includes('@unique')) {
              const fieldName = line.split(/\s+/)[0];
              // Check if index exists in model
              const hasIdx = file.content.includes(`@@index([${fieldName}])`);
              if (!hasIdx) {
                currentModel.missingIndexes.push(fieldName);
                issues.push({
                  id: `db-noidx-${currentModel.name}-${fieldName}`,
                  ruleId: 'DB-INDEX-001',
                  title: `Missing Database Index on Foreign Key \`${currentModel.name}.${fieldName}\``,
                  description: `Foreign key column \`${fieldName}\` in model \`${currentModel.name}\` lacks an explicit index, degrading JOIN and filter performance.`,
                  category: 'DATABASE',
                  severity: 'MEDIUM',
                  location: { filePath: file.path, startLine: lineNum, endLine: lineNum, snippet: line },
                  status: 'OPEN',
                  createdAt: new Date().toISOString(),
                });
              }
            }
          }
        }
      }
    }

    // 2. Raw SQL migrations or schema files
    if (baseName.endsWith('.sql')) {
      const lines = file.content.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;
        const match = line.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_"`]+)/i);
        if (match) {
          models.push({
            name: match[1].replace(/[`"]/g, ''),
            filePath: file.path,
            fieldsCount: 5,
            indexes: [],
            missingIndexes: [],
            relationships: [],
          });
        }
      }
    }
  }

  return { models, issues };
}
