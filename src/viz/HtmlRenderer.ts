import { HTML_TEMPLATE } from './html-template'
import type { LightweightChartAdapter } from './LightweightChartAdapter'
import type { ChartOptions } from './types'

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export class HtmlRenderer {
  private adapter: LightweightChartAdapter
  private options: { title: string }

  constructor(adapter: LightweightChartAdapter, options: ChartOptions = {}) {
    this.adapter = adapter
    this.options = {
      title: options.title ?? 'tala chart',
    }
  }

  render(): string {
    const history = [...this.adapter.getHistory()].reverse()
    const overlays = this.adapter.getOverlayKeys()
    const oscillators = this.adapter.getOscillatorKeys()
    const chartDataScript = this.buildChartDataScript(history, overlays, oscillators)

    return HTML_TEMPLATE
      .replace('{{TITLE}}', escapeHtml(this.options.title))
      .replace('{{CHART_DATA_SCRIPT}}', chartDataScript)
  }

  private buildChartDataScript(
    history: ReturnType<LightweightChartAdapter['getHistory']>,
    overlays: ReturnType<LightweightChartAdapter['getOverlayKeys']>,
    oscillators: ReturnType<LightweightChartAdapter['getOscillatorKeys']>,
  ): string {
    const serializedHistory = history.map(entry => {
      const obj: Record<string, unknown> = {
        open: entry.open,
        high: entry.high,
        low: entry.low,
        close: entry.close,
        volume: entry.volume,
      }
      for (const key of Object.keys(entry)) {
        if (key !== 'open' && key !== 'high' && key !== 'low' && key !== 'close' && key !== 'volume' && key !== 'changeVal') {
          const val = entry[key]
          if (typeof val === 'number') {
            obj[key] = val
          }
        }
      }
      return obj
    })

    const historyJson = JSON.stringify(serializedHistory)
    const overlaysJson = JSON.stringify(overlays)
    const oscillatorsJson = JSON.stringify(oscillators)

    return `
(function() {
  var chartData = ${historyJson};
  var overlayKeys = ${overlaysJson};
  var oscillatorKeys = ${oscillatorsJson};
  var candleData = chartData.map(function(d, i) {
    var t = d.timestamp !== undefined ? d.timestamp : i;
    return { time: t, open: d.open, high: d.high, low: d.low, close: d.close };
  });

  function buildIndicatorData(key) {
    var data = chartData.map(function(d, i) {
      var val = d[key];
      var t = d.timestamp !== undefined ? d.timestamp : i;
      return { time: t, value: (val !== undefined ? val : null) };
    });
    return trimLeadingZeros(data);
  }

  var overlaySeries = overlayKeys.map(function(k) {
    return {
      key: k.key,
      seriesType: k.seriesType,
      data: buildIndicatorData(k.key),
    };
  });

  var oscillatorSeries = oscillatorKeys.map(function(k) {
    if (k.seriesType === 'histogram') {
      var raw = chartData.map(function(d, i) {
        var val = d[k.key];
        var t = d.timestamp !== undefined ? d.timestamp : i;
        return { time: t, value: (val !== undefined ? val : 0), color: (val >= 0 ? '#26a69a' : '#ef5350') };
      });
      return { key: k.key, seriesType: 'histogram', data: raw };
    }
    return {
      key: k.key,
      seriesType: 'line',
      data: buildIndicatorData(k.key),
    };
  });

  /* series visibility map */
  var seriesMap = {};

  function toggleIndicator(key) {
    var ref = seriesMap[key];
    if (!ref) return;
    var newVis = !ref.visible;
    var ok = false;
    try { ref.series.applyOptions({ visible: newVis }); ok = true; } catch(e) {
      try { ref.series.setVisible(newVis); ok = true; } catch(e2) {
        try { ref.series.applyOptions({ color: newVis ? '#2962ff' : 'transparent' }); ok = true; } catch(e3) {}
      }
    }
    if (ok) {
      ref.visible = newVis;
      var row = document.querySelector('.lg-row[data-name="' + key + '"]');
      if (row) {
        var sw = row.querySelector('.lg-switch');
        if (sw) sw.classList.toggle('on', newVis);
        row.setAttribute('aria-checked', newVis ? 'true' : 'false');
      }
    }
  }

  /* sidebar legend */
  var colorMap = { sma: '#2962ff', ema: '#e91e63', wema: '#4caf50', alma: '#ff5722', trix: '#795548', bbUpper: '#f44336', bbLower: '#f44336', atr: '#607d8b', vwap: '#00bcd4', pp: '#ff9800', fib: '#9c27b0', rsi: '#2962ff', macd: '#26a69a', cci: '#ff9800', adx: '#ef5350', williamsR: '#e91e63', stsK: '#4caf50', stsD3: '#ff9800', fisherTransform: '#9c27b0', stochRSI: '#00bcd4', histogram: '#26a69a', signal: '#ef5350' };

  var lastDataPoint = chartData[chartData.length - 1];
  var osc100Keys = oscillatorKeys.filter(function(s) { return s.key.match(/^(rsi|adx|sts)/); });
  var oscMiddleKeys = oscillatorKeys.filter(function(s) { return s.key.match(/^(macd|williams|fisher)/); });
  var oscCCIKey = oscillatorKeys.filter(function(s) { return s.key.match(/^cci/); });

  function buildLegendHtml(groups) {
    var html = '';
    for (var g = 0; g < groups.length; g++) {
      html += '<div class="lg-group">';
      html += '<div class="lg-group-title">' + groups[g].title + '</div>';
      for (var li = 0; li < groups[g].keys.length; li++) {
        var k = groups[g].keys[li];
        var val = groups[g].dataPoint[k.key];
        var ref = seriesMap[k.key];
        var visible = ref ? ref.visible : true;
        if (val !== undefined && val !== null) {
          var label = k.key.toUpperCase().replace(/(\d+)/, ' $1');
          var prefix = k.key.replace(/\\d+$/, '');
          var color = colorMap[prefix] || '#787b86';
          html += '<div class="lg-row" data-name="' + k.key + '" tabindex="0" role="switch" aria-checked="' + (visible ? 'true' : 'false') + '">';
          html += '<span class="lg-dot" style="background:' + color + '"></span>';
          html += '<span class="lg-name">' + label + '</span>';
          html += '<span class="lg-val">' + Number(val).toFixed(2) + '</span>';
          html += '<span class="lg-switch ' + (visible ? 'on' : '') + '"></span>';
          html += '</div>';
        }
      }
      html += '</div>';
    }
    return html;
  }

  /* time-scale sync */
  var chartRefs = [];
  var syncing = false;
  var chartSyncEnabled = true;

  window.toggleChartSync = function() {
    chartSyncEnabled = document.getElementById('sync-cb').checked;
  };

  function syncTimeScales(srcChart) {
    if (syncing || !chartSyncEnabled) return;
    syncing = true;
    var srcRange = srcChart.timeScale().getVisibleRange();
    if (!srcRange) { syncing = false; return; }
    for (var ci = 0; ci < chartRefs.length; ci++) {
      var c = chartRefs[ci];
      if (c !== srcChart) {
        try { c.timeScale().setVisibleRange(srcRange); } catch(e) {}
      }
    }
    syncing = false;
  }

  /* legend init */
  var legendEl = document.getElementById('legend-content');

  function initLegend() {
    if (!legendEl) return;
    var groups = [
      { title: 'Overlays', keys: overlayKeys, dataPoint: lastDataPoint },
      { title: 'Osc (0-100)', keys: osc100Keys, dataPoint: lastDataPoint },
      { title: 'Osc (Around 0)', keys: oscMiddleKeys, dataPoint: lastDataPoint },
      { title: 'CCI', keys: oscCCIKey, dataPoint: lastDataPoint },
    ];
    legendEl.innerHTML = buildLegendHtml(groups);
  }

  /* legend value updates */
  function updateLegendValues(dataPoint) {
    if (!legendEl) return;
    for (var g = 0; g < legendEl.children.length; g++) {
      var group = legendEl.children[g];
      var rows = group.querySelectorAll('.lg-row');
      for (var ri = 0; ri < rows.length; ri++) {
        var row = rows[ri];
        var name = row.getAttribute('data-name');
        if (!name) continue;
        var valEl = row.querySelector('.lg-val');
        if (!valEl) continue;
        var val = dataPoint[name];
        valEl.textContent = val !== undefined && val !== null ? Number(val).toFixed(2) : '—';
      }
    }
  }

  // legend row toggle handlers
  document.addEventListener('click', function(e) {
    var row = e.target.closest('.lg-row');
    if (row) {
      var name = row.getAttribute('data-name');
      if (name) toggleIndicator(name);
    }
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      var row = e.target.closest('.lg-row');
      if (row) {
        e.preventDefault();
        var name = row.getAttribute('data-name');
        if (name) toggleIndicator(name);
      }
    }
  });

  /* trim warm-up zeros */
  function trimLeadingZeros(data) {
    var firstValid = -1;
    for (var i = 0; i < data.length; i++) {
      if (data[i].value !== null && data[i].value !== 0) {
        firstValid = i;
        break;
      }
    }
    if (firstValid > 0) {
      for (var i = 0; i < firstValid; i++) {
        data[i].value = null;
      }
    }
    return data;
  }

  /* per-pane tooltips */
  function makeTooltip(name, keys, chartEl) {
    var el = document.getElementById(name);
    return function(param) {
      if (!param.point || param.time === undefined) {
        el.style.display = 'none';
        updateLegendValues(lastDataPoint);
        return;
      }
      var barIdx = param.logical;
      if (barIdx === undefined || barIdx < 0 || barIdx >= chartData.length) { el.style.display = 'none'; return; }
      var d = chartData[barIdx];
      if (!d) { el.style.display = 'none'; return; }
      updateLegendValues(d);

      var html = '';
      if (name === 'tooltip-main') {
        var dateStr = d.timestamp ? new Date(d.timestamp * 1000).toLocaleString() : '';
        html += '<div class="tt-row"><span class="tt-label">Date</span><span class="tt-value">' + dateStr + '</span></div>';
        html += '<div class="tt-row"><span class="tt-label">O</span><span class="tt-value">' + Number(d.open).toFixed(2) + '</span></div>';
        html += '<div class="tt-row"><span class="tt-label">H</span><span class="tt-value">' + Number(d.high).toFixed(2) + '</span></div>';
        html += '<div class="tt-row"><span class="tt-label">L</span><span class="tt-value">' + Number(d.low).toFixed(2) + '</span></div>';
        html += '<div class="tt-row"><span class="tt-label">C</span><span class="tt-value">' + Number(d.close).toFixed(2) + '</span></div>';
        if (d.volume !== undefined) {
          html += '<div class="tt-row"><span class="tt-label">Vol</span><span class="tt-value">' + Number(d.volume).toLocaleString() + '</span></div>';
        }
      }

      keys.forEach(function(k) {
        if (seriesMap[k.key] && !seriesMap[k.key].visible) return;
        var val = d[k.key];
        if (val !== undefined && val !== null) {
          var label = k.key.toUpperCase().replace(/(\d+)/, ' $1');
          html += '<div class="tt-row"><span class="tt-label">' + label + '</span><span class="tt-value">' + Number(val).toFixed(2) + '</span></div>';
        }
      });

      if (!html) { el.style.display = 'none'; return; }
      el.innerHTML = html;
      el.style.display = 'block';

      // fixed-position tooltip uses viewport coords
      var evt = param.sourceEvent;
      var px = evt ? evt.clientX : (param.point.x + (chartEl ? chartEl.getBoundingClientRect().left : 0));
      var py = evt ? evt.clientY : (param.point.y + (chartEl ? chartEl.getBoundingClientRect().top : 0));
      var tw = el.offsetWidth, th = el.offsetHeight;
      el.style.left = Math.min(window.innerWidth - tw - 4, Math.max(4, px + 14)) + 'px';
      el.style.top = Math.min(window.innerHeight - th - 4, Math.max(4, py - 20)) + 'px';
    };
  }

  var mainChartEl = document.getElementById('main-chart-inner');
  var updateTooltipMain = makeTooltip('tooltip-main', overlayKeys, mainChartEl);
  var candleSeries = null;
  var isFileProtocol = window.location.protocol === 'file:';

  // no recalc in file:// mode
  if (isFileProtocol) {
    var rb = document.getElementById('recalc-btn');
    if (rb) rb.style.display = 'none';
  }

  /* editable data table */
  var modalKeydownHandler = function(e) {
    if (e.key === 'Escape') {
      var modal = document.getElementById('data-modal');
      if (modal && modal.classList.contains('open')) {
        toggleDataTable();
      }
    }
  };
  window.toggleDataTable = function() {
    var modal = document.getElementById('data-modal');
    var btn = document.getElementById('data-btn');
    var isOpen = modal.classList.toggle('open');
    btn.classList.toggle('active');
    if (isOpen && !modal.hasAttribute('data-built')) {
      buildDataTable();
      modal.setAttribute('data-built', 'true');
    }
    if (isOpen) {
      document.addEventListener('keydown', modalKeydownHandler);
      var closeBtn = document.getElementById('data-modal-close');
      if (closeBtn) closeBtn.focus();
    } else {
      document.removeEventListener('keydown', modalKeydownHandler);
      if (btn) btn.focus();
    }
  };
  // close on backdrop click
  document.getElementById('data-modal').addEventListener('click', function(e) {
    if (e.target === this) toggleDataTable();
  });

  function buildDataTable() {
    var table = document.getElementById('data-table');
    if (!table || chartData.length === 0) return;


    var cols = ['open', 'high', 'low', 'close', 'volume'];


    var html = '<thead><tr><th class="col-idx">#</th>';
    cols.forEach(function(c) { html += '<th>' + c.toUpperCase() + '</th>'; });
    html += '</tr></thead><tbody>';


    for (var ri = 0; ri < chartData.length; ri++) {
      var d = chartData[ri];
      html += '<tr><td class="col-idx">' + ri + '</td>';
      cols.forEach(function(c) {
        var val = d[c];
        var display = val !== undefined && val !== null ? Number(val).toFixed(2) : '';
        html += '<td><input type="text" value="' + display + '" data-idx="' + ri + '" data-col="' + c + '"></td>';
      });
      html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;


    table.addEventListener('input', function(e) {
      var inp = e.target;
      if (inp.tagName !== 'INPUT') return;
      var idx = parseInt(inp.getAttribute('data-idx'), 10);
      var col = inp.getAttribute('data-col');
      var raw = inp.value.trim();
      var num = parseFloat(raw);
      if (isNaN(num) || idx < 0 || idx >= chartData.length) {
        if (isNaN(num) && raw !== '') inp.classList.add('invalid');
        return;
      }
      inp.classList.remove('invalid');

      chartData[idx][col] = num;
      updateChartData(idx, col, num);
    });
  }

  function updateChartData(idx, col, num) {
    var d = chartData[idx];
    if (!d) return;
    var t = d.timestamp !== undefined ? d.timestamp : idx;

    // update candle series
    if (candleSeries && ['open','high','low','close'].indexOf(col) >= 0) {
      try { candleSeries.update({ time: t, open: d.open, high: d.high, low: d.low, close: d.close }); } catch(e) {}
    }

    // update legend
    updateLegendValues(chartData[idx]);
  }

  var recalcInFlight = false;
  window.recalcIndicators = function() {
    if (recalcInFlight) return;
    if (isFileProtocol) {
      var notice = document.getElementById('recalc-notice');
      if (notice) { notice.textContent = 'Recalculate requires server mode — run npx tsx demo/test-server.ts'; notice.style.display = 'inline'; }
      setTimeout(function() { if (notice) notice.style.display = 'none'; }, 4000);
      return;
    }
    recalcInFlight = true;
    var btn = document.getElementById('recalc-btn');
    if (btn) btn.textContent = 'Recalculating…';
    // send newest-first (tala order)
    var reversed = chartData.slice().reverse();
    var rawData = reversed.map(function(d) {
      return { timestamp: d.timestamp, open: d.open, high: d.high, low: d.low, close: d.close, volume: d.volume };
    });
    fetch('/recalc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chartData: rawData }),
    }).then(function(r) {
      if (!r.ok) return r.json().then(function(e) { throw new Error(e.error || 'Recalculation failed'); });
      return r.json();
    }).then(function(result) {
      if (!result.chartData) throw new Error('No chartData in response');
      // server returns newest-first; flip back
      var enriched = result.chartData.reverse();
      for (var ri = 0; ri < enriched.length && ri < chartData.length; ri++) {
        chartData[ri] = enriched[ri];
      }
      refreshAllSeries();
      if (btn) btn.textContent = 'Recalculate';
      var notice = document.getElementById('recalc-notice');
      if (notice) { notice.textContent = '✓ Indicators recalculated'; notice.className = 'success'; notice.style.display = 'inline'; }
      setTimeout(function() { if (notice) notice.style.display = 'none'; }, 2000);
    }).catch(function(err) {
      if (btn) btn.textContent = 'Recalculate';
      var notice = document.getElementById('recalc-notice');
      var msg = (err instanceof TypeError)
        ? 'Recalculate requires the server mode (run via npx tsx demo/test-server.ts)'
        : err.message;
      if (notice) { notice.textContent = '✗ ' + msg; notice.style.display = 'inline'; }
      setTimeout(function() { if (notice) notice.style.display = 'none'; }, 3000);
    }).finally(function() {
      recalcInFlight = false;
    });
  };

  function refreshAllSeries() {
    // rebuild series from chartData
    if (candleSeries) {
      var cd = chartData.map(function(d, i) {
        var t = d.timestamp !== undefined ? d.timestamp : i;
        return { time: t, open: d.open, high: d.high, low: d.low, close: d.close };
      });
      try { candleSeries.setData(cd); } catch(e) {}
    }
    // overlay series
    overlayKeys.forEach(function(k) {
      var ref = seriesMap[k.key];
      if (!ref || !ref.series) return;
      var data = chartData.map(function(d, i) {
        var t = d.timestamp !== undefined ? d.timestamp : i;
        var val = d[k.key];
        return { time: t, value: val !== undefined && val !== null ? val : null };
      });
      data = trimLeadingZeros(data);
      try { ref.series.setData(data.filter(function(pt) { return pt.value !== null; })); } catch(e) {}
    });
    // oscillator series
    oscillatorKeys.forEach(function(k) {
      var ref = seriesMap[k.key];
      if (!ref || !ref.series) return;
      var data = chartData.map(function(d, i) {
        var t = d.timestamp !== undefined ? d.timestamp : i;
        var val = d[k.key];
        if (k.seriesType === 'histogram') {
          return { time: t, value: val !== undefined ? val : 0, color: (val >= 0 ? '#26a69a' : '#ef5350') };
        }
        return { time: t, value: val !== undefined && val !== null ? val : null };
      });
      if (k.seriesType !== 'histogram') {
        data = trimLeadingZeros(data).filter(function(pt) { return pt.value !== null; });
      }
      try { ref.series.setData(data); } catch(e) {}
    });
    updateLegendValues(chartData[chartData.length - 1]);
  }

  window.downloadChart = function() {
    var btn = document.getElementById('download-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Generating…'; }
    var chartsEl = document.getElementById('charts');
    if (!chartsEl || typeof html2canvas === 'undefined') {
      var cv = document.querySelector('#main-chart canvas');
      if (cv) {
        var a = document.createElement('a');
        a.download = 'tala-chart.png';
        a.href = cv.toDataURL('image/png');
        a.click();
      }
      if (btn) { btn.disabled = false; btn.textContent = 'Download PNG'; }
      return;
    }
    html2canvas(chartsEl, { backgroundColor: '#131722', useCORS: true, logging: false }).then(function(canvas) {
      var a = document.createElement('a');
      a.download = 'tala-chart.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      if (btn) { btn.disabled = false; btn.textContent = 'Download PNG'; }
    });
  };

  function initCharts() {
    var mainChartEl = document.getElementById('main-chart-inner');
    if (mainChartEl && typeof LightweightCharts !== 'undefined') {
      var mainChart = LightweightCharts.createChart(mainChartEl, {
        width: mainChartEl.clientWidth,
        height: mainChartEl.clientHeight,
        layout: { backgroundColor: '#131722', textColor: '#d1d4dc' },
        grid: { vertLines: { color: '#2a2e39' }, horzLines: { color: '#2a2e39' } },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        timeScale: { timeVisible: true, secondsVisible: false, rightOffset: 5 },
        rightPriceScale: { minimumWidth: 80 },
      });
      candleSeries = mainChart.addCandlestickSeries();
      candleSeries.setData(candleData);
      overlaySeries.forEach(function(s) {
        var prefix = s.key.replace(/\\d+$/, '');
        var color = colorMap[prefix] || '#2962ff';
        var ls = mainChart.addLineSeries({ color: color, lastValueVisible: true, priceLineVisible: false });
        ls.setData(s.data.filter(function(d) { return d.value !== null; }));
        seriesMap[s.key] = { series: ls, visible: true };
      });
      mainChart.subscribeCrosshairMove(updateTooltipMain);
      chartRefs.push(mainChart);
      mainChart.timeScale().subscribeVisibleTimeRangeChange(function() { syncTimeScales(mainChart); });
    }

    // oscillator panes
    var oscContainer = document.getElementById('oscillator-panes');
    function buildOscPane(groupKeys, label) {
      var matchingSeries = oscillatorSeries.filter(function(s) { return groupKeys.indexOf(s.key) >= 0; });
      if (matchingSeries.length === 0) return;
      var tooltipId = 'tooltip-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      var pane = document.createElement('div');
      pane.className = 'oscillator-pane';
      pane.innerHTML = '<div class="chart-container"><span class="pane-label">' + label + '</span><div class="osc-inner"></div><div id="' + tooltipId + '" class="tt"></div></div>';
      oscContainer.appendChild(pane);

      requestAnimationFrame(function() {
        var inner = pane.querySelector('.osc-inner');
        if (!inner || inner.clientWidth === 0 || inner.clientHeight === 0) return;
          var chart = LightweightCharts.createChart(inner, {
            width: inner.clientWidth,
            height: inner.clientHeight,
            layout: { backgroundColor: '#131722', textColor: '#d1d4dc' },
            grid: { vertLines: { color: '#2a2e39' }, horzLines: { color: '#2a2e39' } },
            timeScale: { timeVisible: true, secondsVisible: false, rightOffset: 5 },
            crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
            rightPriceScale: { minimumWidth: 80 },
          });
        var allKeys = [];
        matchingSeries.forEach(function(s) {
          var prefix = s.key.replace(/\\d+$/, '');
          var color = colorMap[prefix] || '#2962ff';
          if (s.seriesType === 'histogram') {
            var hs = chart.addHistogramSeries();
            hs.setData(s.data);
            seriesMap[s.key] = { series: hs, visible: true };
          } else {
            var ls = chart.addLineSeries({ color: color, lastValueVisible: true, priceLineVisible: false });
            ls.setData(s.data.filter(function(d) { return d.value !== null; }));
            seriesMap[s.key] = { series: ls, visible: true };
          }
          allKeys.push(s);
        });
          chart.subscribeCrosshairMove(makeTooltip(tooltipId, allKeys, inner));
        chartRefs.push(chart);
        chart.timeScale().subscribeVisibleTimeRangeChange(function() { syncTimeScales(chart); });
      });
    }

    var oscKeys100 = oscillatorSeries.filter(function(s) { return s.key.match(/^(rsi|adx|sts)/); }).map(function(s) { return s.key; });
    var oscMidKeys = oscillatorSeries.filter(function(s) { return s.key.match(/^(macd|williams|fisher)/); }).map(function(s) { return s.key; });
    var oscKeysCCI = oscillatorSeries.filter(function(s) { return s.key.match(/^cci/); }).map(function(s) { return s.key; });

    if (oscContainer) {
      buildOscPane(oscKeys100, 'RSI · ADX · Stoch');
      buildOscPane(oscMidKeys, 'MACD · WilliamsR · Fisher');
      buildOscPane(oscKeysCCI, 'CCI');
    }
    initLegend();

    // align time scales to full range
    if (chartData.length > 0) {
      var t0 = chartData[0].timestamp;
      var t1 = chartData[chartData.length - 1].timestamp;
      if (t0 === undefined) { t0 = 0; t1 = chartData.length - 1; }
      var fullRange = { from: Math.min(t0, t1), to: Math.max(t0, t1) };
      setTimeout(function() {
        for (var ci = 0; ci < chartRefs.length; ci++) {
          try {
            chartRefs[ci].timeScale().setVisibleRange(fullRange);
          } catch(e) {}
        }
      }, 300);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCharts);
  } else {
    initCharts();
  }
})();
`
  }
}
