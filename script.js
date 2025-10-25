// Calculator with history saved in localStorage under key "calc_history"
(() => {
  const exprEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const keys = document.querySelectorAll('.keys .btn');
  const historyKey = 'calc_history';
  const historyListEl = document.getElementById('historyList');
  const historyPanel = document.getElementById('historyPanel');
  const historyToggle = document.getElementById('historyToggle');
  const clearHistoryBtn = document.getElementById('clearHistory');
  const exportHistoryBtn = document.getElementById('exportHistory');

  let expr = '';

  function setExpression(v) {
    expr = v;
    exprEl.textContent = expr || '0';
  }
  function setResult(v) {
    resultEl.value = v !== undefined ? v : '';
  }

  function safeEvaluate(s) {
    // minimal sanitization: allow digits, operators, parentheses, dot and spaces
    if (!s || /[^0-9+\-*/().% \t]/.test(s)) throw new Error('Invalid characters');
    // replace integer percent: "50%" -> "(50/100)"
    s = s.replace(/([0-9.]+)%/g, '($1/100)');
    // evaluate
    const fn = new Function('return ' + s);
    const r = fn();
    if (!isFinite(r)) throw new Error('Math error');
    return r;
  }

  function pushHistory(entry) {
    try {
      const arr = JSON.parse(localStorage.getItem(historyKey) || '[]');
      arr.unshift(entry);
      if (arr.length > 200) arr.length = 200;
      localStorage.setItem(historyKey, JSON.stringify(arr));
      renderHistory();
    } catch (e) { console.warn(e) }
  }

  function renderHistory() {
    const arr = JSON.parse(localStorage.getItem(historyKey) || '[]');
    historyListEl.innerHTML = '';
    if (arr.length === 0) {
      historyListEl.innerHTML = '<li style="color:var(--muted)">No history</li>';
      return;
    }
    arr.forEach((h, idx) => {
      const li = document.createElement('li');
      const left = document.createElement('div');
      left.innerHTML = `<div class="expr">${h.expression}</div><div style="font-size:12px;color:var(--muted)">${new Date(h.time).toLocaleString()}</div>`;
      const right = document.createElement('div');
      right.innerHTML = `<span class="val">${h.result}</span> <button class="small" data-load="${idx}">Use</button>`;
      li.appendChild(left);
      li.appendChild(right);
      historyListEl.appendChild(li);
    });

    // attach use buttons (note: index reversed because we store newest first)
    historyListEl.querySelectorAll('button[data-load]').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        const idx = Number(ev.currentTarget.getAttribute('data-load'));
        const arr2 = JSON.parse(localStorage.getItem(historyKey) || '[]');
        const item = arr2[idx];
        if (!item) return;
        setExpression(item.expression);
        setResult(item.result);
      });
    });
  }

  // key handlers
  keys.forEach(k => {
    if (k.dataset.value) {
      k.addEventListener('click', () => {
        setExpression(expr + k.dataset.value);
        setResult('');
      });
    } else if (k.dataset.action) {
      k.addEventListener('click', () => {
        const a = k.dataset.action;
        if (a === 'clear') {
          setExpression('');
          setResult('');
        } else if (a === 'back') {
          setExpression(expr.slice(0, -1));
        } else if (a === 'equals') {
          doCalculate();
        } else if (a === 'percent') {
          setExpression(expr + '%');
        }
      });
    }
  });

  function doCalculate() {
    if (!expr) return;
    try {
      const r = safeEvaluate(expr);
      setResult(String(r));
      pushHistory({ expression: expr, result: String(r), time: Date.now() });
      // keep expression as result for chaining
      setExpression(String(r));
    } catch (err) {
      setResult('Error');
      console.warn(err);
    }
  }

  // keyboard support
  window.addEventListener('keydown', (e) => {
    if ((e.key >= '0' && e.key <= '9') || ['.','+','-','*','/','(',')','%'].includes(e.key)) {
      setExpression(expr + e.key);
      setResult('');
      return;
    }
    if (e.key === 'Enter') { e.preventDefault(); doCalculate(); return; }
    if (e.key === 'Backspace') { setExpression(expr.slice(0,-1)); return; }
    if (e.key === 'Escape') { setExpression(''); setResult(''); return; }
  });

  // history UI
  historyToggle.addEventListener('click', () => {
    const hidden = historyPanel.getAttribute('aria-hidden') === 'true';
    historyPanel.setAttribute('aria-hidden', String(!hidden));
    historyPanel.style.display = hidden ? 'block' : 'none';
  });

  clearHistoryBtn.addEventListener('click', () => {
    if (!confirm('Clear all history?')) return;
    localStorage.removeItem(historyKey);
    renderHistory();
  });

  exportHistoryBtn.addEventListener('click', () => {
    const arr = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const blob = new Blob([JSON.stringify(arr, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calculator_history.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // init
  setExpression('');
  setResult('');
  renderHistory();
  // show history by default on wide screens
  if (window.innerWidth > 880) historyPanel.style.display = 'block';
})();
