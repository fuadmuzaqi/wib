(() => {
  const clockEl = document.getElementById('clock');
  const statusEl = document.getElementById('status');
  const tzLabelEl = document.getElementById('tzLabel');
  const errEl = document.getElementById('error');

  // Konstanta WIB (UTC+7) dalam milidetik
  const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

  let baseEpochMs = null;
  let basePerf = null;
  let animHandle = null;
  let resyncTimer = null;

  function pad2(n) { return String(n).padStart(2, '0'); }
  function pad3(n) { return String(n).padStart(3, '0'); }

  function setStatusSynced() {
    statusEl.textContent = 'Disinkronkan dari API server (WIB)';
    statusEl.classList.remove('error');
    statusEl.classList.add('synced');
    errEl.hidden = true;
  }

  function setStatusError(msg) {
    statusEl.textContent = 'Gagal menyinkronkan API';
    statusEl.classList.remove('synced');
    statusEl.classList.add('error');
    errEl.hidden = false;
    errEl.textContent = msg;
  }

  async function fetchServerTime() {
    const res = await fetch('/api/time', { cache: 'no-store' });
    if (!res.ok) throw new Error(`API status ${res.status}`);
    const data = await res.json();
    if (!('epoch_ms' in data)) throw new Error('Payload tidak valid: epoch_ms tidak ada');
    return data;
  }

  function wibHMSmsFromEpoch(epochMs) {
    // Tambahkan offset WIB lalu gunakan UTC getter untuk hindari TZ device
    const wibMs = epochMs + WIB_OFFSET_MS;
    const d = new Date(wibMs);
    const h = pad2(d.getUTCHours());
    const m = pad2(d.getUTCMinutes());
    const s = pad2(d.getUTCSeconds());
    const ms = pad3(d.getUTCMilliseconds());
    return `${h}:${m}:${s}:${ms}`;
  }

  function render() {
    if (baseEpochMs == null) {
      animHandle = requestAnimationFrame(render);
      return;
    }
    const nowMs = baseEpochMs + (performance.now() - basePerf);
    const text = wibHMSmsFromEpoch(nowMs);
    if (clockEl.textContent !== text) {
      clockEl.textContent = text;
      document.title = text + ' — WIB';
    }
    animHandle = requestAnimationFrame(render);
  }

  async function start() {
    try {
      const data = await fetchServerTime();
      baseEpochMs = data.epoch_ms;
      basePerf = performance.now();
      setStatusSynced();
      if (animHandle) cancelAnimationFrame(animHandle);
      render();
      if (resyncTimer) clearInterval(resyncTimer);
      // Re-sync tiap 5 menit untuk koreksi drift, tetap tanpa pakai waktu device sebagai sumber
      resyncTimer = setInterval(async () => {
        try {
          const d = await fetchServerTime();
          baseEpochMs = d.epoch_ms;
          basePerf = performance.now();
        } catch (e) {
          setStatusError('Re-sync gagal: ' + e.message);
          // Lanjutkan render berdasarkan baseline terakhir
        }
      }, 5 * 60 * 1000);
    } catch (e) {
      setStatusError('API tidak dapat diakses: ' + e.message + '. Coba refresh atau periksa server.');
      // Jangan tampilkan jam jika tidak ada baseline server
      clockEl.textContent = '00:00:00:000';
    }
  }

  start();
})();
