import { ScanResult } from '@ai-scanner/shared';

export function generateCsvReport(scan: ScanResult): string {
  const headers = ['Issue ID', 'Rule ID', 'Title', 'Severity', 'Category', 'CWE', 'File Path', 'Start Line', 'Status', 'Remediation Effort'];
  
  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = scan.issues.map((iss) => [
    escapeCsv(iss.id),
    escapeCsv(iss.ruleId),
    escapeCsv(iss.title),
    escapeCsv(iss.severity),
    escapeCsv(iss.category),
    escapeCsv(iss.cwe || ''),
    escapeCsv(iss.location.filePath),
    escapeCsv(iss.location.startLine),
    escapeCsv(iss.status),
    escapeCsv(iss.remediation?.estimatedEffort || 'N/A'),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function generateJsonReport(scan: ScanResult): string {
  return JSON.stringify(scan, null, 2);
}
