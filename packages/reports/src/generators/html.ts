import { ScanResult } from '@ai-scanner/shared';

export function generateInteractiveHtmlReport(scan: ScanResult, projectName: string = 'System Audit'): string {
  const criticalCount = scan.issues.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = scan.issues.filter((i) => i.severity === 'HIGH').length;
  const mediumCount = scan.issues.filter((i) => i.severity === 'MEDIUM').length;
  const lowCount = scan.issues.filter((i) => i.severity === 'LOW').length;

  const serializedData = JSON.stringify(scan).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security & Quality Audit Report - ${projectName}</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --card-border: #1f2937;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #6366f1;
      --critical: #ef4444;
      --high: #f97316;
      --medium: #eab308;
      --low: #3b82f6;
      --info: #8b5cf6;
      --success: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 32px 24px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--card-border); padding-bottom: 24px; margin-bottom: 32px; }
    .title { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #a5b4fc, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 20px; }
    .card-title { font-size: 13px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; margin-bottom: 8px; }
    .card-value { font-size: 32px; font-weight: 700; }
    .grade-badge { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 50%; font-size: 28px; font-weight: 900; background: rgba(99, 102, 241, 0.15); border: 2px solid var(--primary); color: #c7d2fe; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-critical { background: rgba(239, 68, 68, 0.2); color: var(--critical); border: 1px solid var(--critical); }
    .badge-high { background: rgba(249, 115, 22, 0.2); color: var(--high); border: 1px solid var(--high); }
    .badge-medium { background: rgba(234, 179, 8, 0.2); color: var(--medium); border: 1px solid var(--medium); }
    .badge-low { background: rgba(59, 130, 246, 0.2); color: var(--low); border: 1px solid var(--low); }
    .badge-info { background: rgba(139, 92, 246, 0.2); color: var(--info); border: 1px solid var(--info); }
    .section-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .controls { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    input.search-bar { background: var(--card-bg); border: 1px solid var(--card-border); color: var(--text); padding: 10px 16px; border-radius: 8px; flex: 1; min-width: 260px; }
    select.filter-select { background: var(--card-bg); border: 1px solid var(--card-border); color: var(--text); padding: 10px 16px; border-radius: 8px; }
    .issue-item { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px; padding: 18px; margin-bottom: 14px; transition: border-color 0.2s; }
    .issue-item:hover { border-color: #374151; }
    .issue-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .issue-title { font-weight: 600; font-size: 16px; }
    .issue-loc { color: var(--text-muted); font-size: 13px; font-family: monospace; }
    .issue-desc { color: #d1d5db; font-size: 14px; margin-bottom: 12px; line-height: 1.5; }
    .remediation-box { background: #0b1120; border-left: 4px solid var(--primary); padding: 14px; border-radius: 0 8px 8px 0; margin-top: 12px; font-size: 13px; }
    .remediation-box pre { background: #030712; padding: 10px; border-radius: 6px; overflow-x: auto; color: #a7f3d0; margin-top: 8px; font-family: monospace; }
    .scores-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-top: 16px; }
    .score-tile { background: #1f2937; padding: 12px; border-radius: 8px; text-align: center; }
    .score-tile span { display: block; font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
    .score-tile strong { font-size: 18px; color: #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 class="title">${projectName}</h1>
        <div class="subtitle">Scan Date: ${new Date(scan.scanDate).toUTCString()} | Duration: ${scan.durationMs}ms | Engine: System Audit v1.0</div>
      </div>
      <div class="grade-badge">${scan.scores.grade}</div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Overall Score</div>
        <div class="card-value" style="color: ${scan.scores.overall >= 80 ? 'var(--success)' : scan.scores.overall >= 60 ? 'var(--medium)' : 'var(--critical)'}">${scan.scores.overall}<span style="font-size: 18px; color: var(--text-muted)">/100</span></div>
      </div>
      <div class="card">
        <div class="card-title">Critical Findings</div>
        <div class="card-value" style="color: var(--critical)">${criticalCount}</div>
      </div>
      <div class="card">
        <div class="card-title">High Severity</div>
        <div class="card-value" style="color: var(--high)">${highCount}</div>
      </div>
      <div class="card">
        <div class="card-title">Medium & Low</div>
        <div class="card-value" style="color: var(--medium)">${mediumCount + lowCount}</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 32px">
      <div class="card-title">Category Health Breakdown</div>
      <div class="scores-grid">
        <div class="score-tile"><span>Security</span><strong>${scan.scores.security}/100</strong></div>
        <div class="score-tile"><span>Code Quality</span><strong>${scan.scores.quality}/100</strong></div>
        <div class="score-tile"><span>Performance</span><strong>${scan.scores.performance}/100</strong></div>
        <div class="score-tile"><span>Architecture</span><strong>${scan.scores.architecture}/100</strong></div>
        <div class="score-tile"><span>Maintainability</span><strong>${scan.scores.maintainability}/100</strong></div>
        <div class="score-tile"><span>Documentation</span><strong>${scan.scores.documentation}/100</strong></div>
        <div class="score-tile"><span>Testing</span><strong>${scan.scores.testing}/100</strong></div>
      </div>
    </div>

    <h2 class="section-title">Detected Issues (${scan.issues.length})</h2>
    <div class="controls">
      <input type="text" id="searchInput" class="search-bar" placeholder="Search issues by title, file, or rule ID...">
      <select id="severityFilter" class="filter-select">
        <option value="ALL">All Severities</option>
        <option value="CRITICAL">Critical (${criticalCount})</option>
        <option value="HIGH">High (${highCount})</option>
        <option value="MEDIUM">Medium (${mediumCount})</option>
        <option value="LOW">Low (${lowCount})</option>
      </select>
    </div>

    <div id="issuesList">
      ${scan.issues.map((iss) => `
        <div class="issue-item" data-severity="${iss.severity}" data-title="${iss.title.toLowerCase()}" data-file="${iss.location.filePath.toLowerCase()}">
          <div class="issue-header">
            <span class="issue-title">${iss.title}</span>
            <span class="badge badge-${iss.severity.toLowerCase()}">${iss.severity}</span>
          </div>
          <div class="issue-loc">${iss.location.filePath}:${iss.location.startLine} ${iss.cwe ? `(${iss.cwe})` : ''}</div>
          <div class="issue-desc">${iss.description}</div>
          ${iss.remediation ? `
            <div class="remediation-box">
              <strong>AI Remediation & Fix Recommendation:</strong>
              <div>${iss.remediation.recommendedFix}</div>
              ${iss.remediation.diffPatch ? `<pre><code>${iss.remediation.diffPatch}</code></pre>` : ''}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  </div>

  <script>
    const searchInput = document.getElementById('searchInput');
    const severityFilter = document.getElementById('severityFilter');
    const items = document.querySelectorAll('.issue-item');

    function filterIssues() {
      const q = searchInput.value.toLowerCase();
      const sev = severityFilter.value;

      items.forEach(item => {
        const itemSev = item.getAttribute('data-severity');
        const itemTitle = item.getAttribute('data-title');
        const itemFile = item.getAttribute('data-file');

        const matchesSev = (sev === 'ALL' || itemSev === sev);
        const matchesQuery = !q || itemTitle.includes(q) || itemFile.includes(q);

        item.style.display = (matchesSev && matchesQuery) ? 'block' : 'none';
      });
    }

    searchInput.addEventListener('input', filterIssues);
    severityFilter.addEventListener('change', filterIssues);
  </script>
</body>
</html>`;
}
