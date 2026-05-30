export const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{TITLE}}</title>
  <!-- SRI hashes should be generated with: curl -s <url> | openssl dgst -sha384 -binary | openssl base64 -A -->
  <script src="https://cdn.jsdelivr.net/npm/lightweight-charts@4.1.0/dist/lightweight-charts.standalone.production.js" crossorigin="anonymous" integrity="sha384-rcCMiCptH4kTlEbg0euOTUKWe72TESbrjElatnG+9BfbmUIV268UK/Pro5biJdGm"></script>
  <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js" crossorigin="anonymous" integrity="sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #131722;
      color: #d1d4dc;
      height: 100vh;
      overflow: hidden;
    }
    #layout { display: flex; height: 100vh; }

    /* ---- sidebar ---- */
    #sidebar {
      width: 210px;
      background: #1e222d;
      border-right: 1px solid #2a2e39;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    #sidebar-title {
      font-size: 12px;
      font-weight: 600;
      color: #787b86;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 12px 4px;
    }
    #sync-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 2px 12px 6px;
      font-size: 10px;
      color: #787b86;
      cursor: pointer;
      user-select: none;
    }
    #sync-toggle:hover { color: #d1d4dc; }
    #sync-cb {
      width: 12px; height: 12px;
      accent-color: #2962ff;
      cursor: pointer;
    }
    #legend-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 12px 12px;
    }
    #legend-content::-webkit-scrollbar { width: 6px; }
    #legend-content::-webkit-scrollbar-thumb { background: #2a2e39; border-radius: 3px; }
    #legend-content::-webkit-scrollbar-track { background: transparent; }

    /* ---- main area ---- */
    #main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    #header {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 8px 16px;
      background: #1e222d;
      border-bottom: 1px solid #2a2e39;
      min-height: 44px;
    }
    #data-btn {
      background: #2a2e39;
      color: #d1d4dc;
      border: 1px solid #3a3e49;
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.15s;
      margin-right: 8px;
    }
    #data-btn:hover { background: #3a3e49; }
    #data-btn.active { background: #2962ff; border-color: #2962ff; color: #fff; }
    #data-btn:focus-visible { outline: 2px solid #4a8eff; outline-offset: 2px; }

    #download-btn {
      background: #2962ff;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.15s;
    }
    #download-btn:hover { background: #1e53e5; }
    #download-btn:disabled { background: #3a3e49; color: #787b86; cursor: default; }
    #download-btn:focus-visible { outline: 2px solid #4a8eff; outline-offset: 2px; }

    /* ---- charts ---- */
    #charts { flex: 1; display: flex; flex-direction: column; }
    .chart-pane { overflow: hidden; }
    #main-chart { flex: 6; min-height: 0; z-index: 2; }
    #oscillator-panes { flex: 4; display: flex; flex-direction: column; overflow-y: auto; }
    #oscillator-panes::-webkit-scrollbar { width: 6px; }
    #oscillator-panes::-webkit-scrollbar-thumb { background: #2a2e39; border-radius: 3px; }
    #oscillator-panes::-webkit-scrollbar-track { background: transparent; }
    .oscillator-pane { flex: 1; min-height: 80px; border-top: 1px solid #2a2e39; }
    .pane-label {
      position: absolute;
      top: 4px;
      left: 8px;
      font-size: 10px;
      color: #787b86;
      z-index: 1;
      pointer-events: none;
    }
    .chart-container { position: relative; width: 100%; height: 100%; }
    #main-chart-inner, .osc-inner { width: 100%; height: 100%; }

    /* ---- data modal ---- */
    #data-modal {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(0,0,0,0.6);
      align-items: center;
      justify-content: center;
    }
    #data-modal.open { display: flex; }
    #data-modal-content {
      background: #1e222d;
      border: 1px solid #2a2e39;
      border-radius: 6px;
      width: 90vw;
      max-width: 1000px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }
    #data-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-bottom: 1px solid #2a2e39;
    }
    #data-modal-header h3 { font-size: 13px; color: #d1d4dc; font-weight: 600; }
    #recalc-btn {
      background: #2962ff;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 4px 10px;
      font-size: 11px;
      cursor: pointer;
      margin-right: 8px;
    }
    #recalc-btn:hover { background: #1e53e5; }
    #recalc-notice {
      display: none;
      font-size: 11px;
      color: #ff9800;
      margin-right: 8px;
      vertical-align: middle;
    }
    #recalc-notice.success { color: #26a69a; }
    #data-modal-close {
      background: none;
      border: none;
      color: #787b86;
      font-size: 18px;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
    }
    #data-modal-close:hover { color: #d1d4dc; }
    #data-table-wrap {
      overflow: auto;
      padding: 0;
    }
    #data-table-wrap::-webkit-scrollbar { height: 6px; width: 6px; }
    #data-table-wrap::-webkit-scrollbar-thumb { background: #2a2e39; border-radius: 3px; }
    #data-table-wrap::-webkit-scrollbar-track { background: transparent; }
    #legend-content { scrollbar-width: thin; scrollbar-color: #2a2e39 transparent; }
    #oscillator-panes { scrollbar-width: thin; scrollbar-color: #2a2e39 transparent; }
    #data-table-wrap { scrollbar-width: thin; scrollbar-color: #2a2e39 transparent; }
    #recalc-btn.hidden { display: none; }
    #data-table input.invalid { border-color: #ef5350; background: rgba(239, 83, 80, 0.1); }
    #data-table {
      border-collapse: collapse;
      width: 100%;
      font-size: 11px;
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    }
    #data-table th {
      position: sticky;
      top: 0;
      background: #1e222d;
      color: #787b86;
      font-weight: 600;
      padding: 6px 8px;
      text-align: right;
      border-bottom: 1px solid #2a2e39;
      white-space: nowrap;
      z-index: 1;
    }
    #data-table td { padding: 2px 4px; }
    #data-table tr:nth-child(even) { background: #131722; }
    #data-table tr:nth-child(odd) { background: #1a1e28; }
    #data-table tr:hover { background: #2a2e39; }
    #data-table input {
      background: transparent;
      border: 1px solid transparent;
      color: #d1d4dc;
      font-size: 11px;
      font-family: inherit;
      text-align: right;
      padding: 2px 6px;
      width: 100%;
      outline: none;
      border-radius: 2px;
    }
    #data-table input:hover { border-color: #3a3e49; }
    #data-table input:focus { border-color: #2962ff; background: #1e222d; }
    #data-table .col-idx { color: #787b86; text-align: center; width: 40px; }

    /* ---- tooltips ---- */
    .tt { position: fixed; display: none; background: #1e222d; border: 1px solid #2a2e39; border-radius: 4px; padding: 8px 10px; font-size: 11px; line-height: 1.6; pointer-events: none; z-index: 9999; white-space: nowrap; }
    .tt-row { display: flex; justify-content: space-between; gap: 16px; }
    .tt-label { color: #787b86; }
    .tt-value { color: #d1d4dc; font-weight: 500; text-align: right; }

    /* ---- sidebar legend rows ---- */
    .lg-group { margin-bottom: 10px; }
    .lg-group-title {
      font-size: 10px;
      color: #787b86;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 4px;
      padding-bottom: 4px;
      border-bottom: 1px solid #2a2e39;
    }
    .lg-row {
      display: flex;
      align-items: center;
      padding: 3px 4px;
      margin: 0 -4px;
      font-size: 11px;
      cursor: pointer;
      user-select: none;
      border-radius: 3px;
      transition: background-color 0.1s;
    }
    .lg-row:hover { background: #2a2e39; }
    .lg-row:focus-visible { outline: 1px solid #4a8eff; outline-offset: -1px; }

    .lg-dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; flex-shrink: 0; }
    .lg-name { flex: 1; color: #d1d4dc; }
    .lg-val { color: #d1d4dc; font-weight: 500; text-align: right; margin-right: 6px; }
    .lg-switch {
      width: 22px; height: 11px;
      background: #3a3e49;
      border-radius: 6px;
      position: relative;
      flex-shrink: 0;
      transition: background-color 0.12s;
    }
    .lg-switch.on { background: #2962ff; }
    .lg-switch::after {
      content: '';
      position: absolute;
      top: 1.5px; left: 1.5px;
      width: 8px; height: 8px;
      background: #fff;
      border-radius: 50%;
      transition: transform 0.12s;
    }
    .lg-switch.on::after { transform: translateX(12px); }
  </style>
</head>
<body>
  <div id="layout">
    <aside id="sidebar">
      <h2 id="sidebar-title">Indicators</h2>
      <label id="sync-toggle"><input type="checkbox" id="sync-cb" checked onchange="toggleChartSync()"> Link charts</label>
      <div id="legend-content"></div>
    </aside>
    <main id="main-area">
      <div id="header">
        <button id="data-btn" onclick="toggleDataTable()">Data</button>
        <button id="download-btn" onclick="downloadChart()">Download PNG</button>
      </div>
      <div id="charts">
        <div id="main-chart" class="chart-pane"><div class="chart-container"><div id="main-chart-inner" role="img" aria-label="Price chart"></div></div></div>
        <div id="oscillator-panes"></div>
      </div>
      <div id="data-modal"><div id="data-modal-content" role="dialog" aria-modal="true" aria-labelledby="data-modal-title"><div id="data-modal-header"><h3 id="data-modal-title">Data</h3><div><span id="recalc-notice">Re-run tala on this data to refresh indicators →</span><button id="recalc-btn" onclick="recalcIndicators()">Recalculate</button><button id="data-modal-close" aria-label="Close data table" onclick="toggleDataTable()">✕</button></div></div><div id="data-table-wrap"><table id="data-table"></table></div></div></div>
    </main>
  </div>
  <div id="tooltip-main" class="tt"></div>
  <script>
    {{CHART_DATA_SCRIPT}}
  </script>
</body>
</html>`;