import { ScanResult } from '@ai-scanner/shared';

export function generatePrintablePdfHtml(scan: ScanResult, projectName: string = 'System Audit'): string {
  const criticalCount = scan.issues.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = scan.issues.filter((i) => i.severity === 'HIGH').length;
  const mediumCount = scan.issues.filter((i) => i.severity === 'MEDIUM').length;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Security Audit Report - ${projectName}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #111827; line-height: 1.5; font-size: 11pt; }
    .header { border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 24pt; font-weight: bold; color: #1e1b4b; }
    .meta { font-size: 9pt; color: #6b7280; }
    .grade-box { border: 2px solid #4f46e5; padding: 12px 24px; text-align: center; border-radius: 8px; }
    .grade-label { font-size: 9pt; text-transform: uppercase; color: #6b7280; }
    .grade-val { font-size: 28pt; font-weight: 900; color: #4f46e5; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; }
    .summary-card span { font-size: 8pt; color: #6b7280; text-transform: uppercase; display: block; }
    .summary-card strong { font-size: 16pt; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 24px; font-size: 9pt; }
    th { background: #f3f4f6; text-align: left; padding: 8px; border-bottom: 1px solid #d1d5db; font-weight: 600; }
    td { padding: 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 8pt; font-weight: bold; }
    .badge-CRITICAL { background: #fee2e2; color: #991b1b; }
    .badge-HIGH { background: #ffedd5; color: #9a3412; }
    .badge-MEDIUM { background: #fef9c3; color: #854d0e; }
    .badge-LOW { background: #dbeafe; color: #1e40af; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">Code Quality & Security Audit</div>
      <div class="meta">Project: ${projectName} | Date: ${new Date(scan.scanDate).toLocaleDateString()} | Scan ID: ${scan.id}</div>
    </div>
    <div class="grade-box">
      <div class="grade-label">Security Grade</div>
      <div class="grade-val">${scan.scores.grade}</div>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-card"><span>Overall Score</span><strong>${scan.scores.overall}/100</strong></div>
    <div class="summary-card"><span>Critical Issues</span><strong style="color: #991b1b">${criticalCount}</strong></div>
    <div class="summary-card"><span>High Issues</span><strong style="color: #9a3412">${highCount}</strong></div>
    <div class="summary-card"><span>Maintainability</span><strong>${scan.scores.maintainability}/100</strong></div>
  </div>

  <h3>Executive Summary</h3>
  <p>An automated multi-stage static analysis scan was performed on <strong>${scan.metrics.totalFiles}</strong> source files across <strong>${scan.languages.map((l) => l.language).join(', ')}</strong>. The scan detected <strong>${scan.issues.length}</strong> potential items across security, architectural coupling, code quality, and dependency compliance.</p>

  <h3>Top Vulnerabilities & Findings</h3>
  <table>
    <thead>
      <tr>
        <th>Severity</th>
        <th>Rule / Title</th>
        <th>Location</th>
        <th>Category</th>
      </tr>
    </thead>
    <tbody>
      ${scan.issues.slice(0, 30).map((iss) => `
        <tr>
          <td><span class="badge badge-${iss.severity}">${iss.severity}</span></td>
          <td><strong>${iss.title}</strong><br><span style="color: #4b5563; font-size: 8pt">${iss.description.substring(0, 100)}...</span></td>
          <td style="font-family: monospace;">${iss.location.filePath}:${iss.location.startLine}</td>
          <td>${iss.category}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;
}
