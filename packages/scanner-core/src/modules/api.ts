import { ApiEndpoint, ScanIssue } from '@ai-scanner/shared';
import { ProjectFileEntry } from './statistics';

export interface ApiAnalysisResult {
  endpoints: ApiEndpoint[];
  issues: ScanIssue[];
  openApiSpec: Record<string, any>;
}

export function analyzeApis(files: ProjectFileEntry[]): ApiAnalysisResult {
  const endpoints: ApiEndpoint[] = [];
  const issues: ScanIssue[] = [];

  for (const file of files) {
    const lines = file.content.split(/\r?\n/);

    // 1. Next.js 13/14/15 App Router Route Handlers (app/**/route.ts)
    if (file.path.includes('route.ts') || file.path.includes('route.js')) {
      const routePath = '/' + file.path
        .replace(/^.*app[/\\]/, '')
        .replace(/[/\\]route\.(?:ts|js)$/, '')
        .replace(/\\/g, '/');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;
        const match = line.match(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s*\(/);
        if (match) {
          const method = match[1] as any;
          const hasAuth = /auth|session|token|getUser|getServerSession|verifyJwt/i.test(file.content);
          const hasValidation = /zod|\.parse\(|\.safeParse\(|validator|schema/i.test(file.content);

          endpoints.push({
            method,
            path: routePath || '/',
            handler: `${method} handler`,
            filePath: file.path,
            line: lineNum,
            hasAuth,
            hasValidation,
            parameters: [],
          });

          if (!hasAuth && method !== 'GET') {
            issues.push({
              id: `api-noauth-${file.path}-${lineNum}`,
              ruleId: 'API-AUTH-001',
              title: `State-Changing API Route \`${method} ${routePath}\` Missing Authentication Check`,
              description: 'Endpoint mutates server state without an explicit authorization or session verification check.',
              category: 'API',
              severity: 'HIGH',
              cwe: 'CWE-306',
              location: { filePath: file.path, startLine: lineNum, endLine: lineNum, snippet: line.trim() },
              status: 'OPEN',
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    // 2. Express / Fastify / Koa routes
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      const expressMatch = line.match(/(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/i);
      if (expressMatch) {
        const method = expressMatch[1].toUpperCase() as any;
        const routePath = expressMatch[2];
        const hasAuth = /auth|passport|verify|jwt|protect|guard/i.test(line) || /auth|passport/i.test(file.content);
        const hasValidation = /validate|zod|joi|checkSchema/i.test(line);

        endpoints.push({
          method,
          path: routePath,
          handler: `express_${method}`,
          filePath: file.path,
          line: lineNum,
          hasAuth,
          hasValidation,
          parameters: [],
        });
      }

      // 3. FastAPI / Flask Python routes
      const pyMatch = line.match(/@(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/i);
      if (pyMatch) {
        const method = pyMatch[1].toUpperCase() as any;
        const routePath = pyMatch[2];
        endpoints.push({
          method,
          path: routePath,
          handler: `py_${method}`,
          filePath: file.path,
          line: lineNum,
          hasAuth: /Depends\(.*auth/i.test(line) || /login_required/.test(line),
          hasValidation: true,
          parameters: [],
        });
      }

      // 4. Spring Boot Java routes
      const springMatch = line.match(/@(GetMapping|PostMapping|PutMapping|DeleteMapping|RequestMapping)\s*\(\s*(?:value\s*=\s*)?["']([^"']+)["']/i);
      if (springMatch) {
        const verb = springMatch[1].replace('Mapping', '').toUpperCase() || 'GET';
        endpoints.push({
          method: (verb === 'REQUEST' ? 'GET' : verb) as any,
          path: springMatch[2],
          handler: `spring_${verb}`,
          filePath: file.path,
          line: lineNum,
          hasAuth: /@PreAuthorize|@Secured/.test(file.content),
          hasValidation: /@Valid|@Validated/.test(file.content),
          parameters: [],
        });
      }
    }
  }

  // Generate OpenAPI 3.0 specification
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'Scanned Project REST API Documentation',
      version: '1.0.0',
      description: 'Auto-extracted API definitions and security analysis',
    },
    paths: {} as Record<string, any>,
  };

  for (const ep of endpoints) {
    if (!openApiSpec.paths[ep.path]) {
      openApiSpec.paths[ep.path] = {};
    }
    openApiSpec.paths[ep.path][ep.method.toLowerCase()] = {
      summary: `${ep.method} ${ep.path}`,
      responses: {
        '200': { description: 'Successful response' },
        '401': { description: 'Unauthorized' },
        '400': { description: 'Invalid input parameters' },
      },
      security: ep.hasAuth ? [{ BearerAuth: [] }] : [],
    };
  }

  return { endpoints, issues, openApiSpec };
}
