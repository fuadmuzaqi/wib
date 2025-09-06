(() => {
  const clockEl = document.getElementById('clock');
  const statusEl = document.getElementById('status');

  const timeZone = 'Asia/Jakarta';

  let baseEpochMs = null;
  let basePerf = null;

  function setStatus(text, mode) {
    statusEl.textContent = text;
    statusEl.className = 'pill ' + (mode || '');
  }

  async function syncTime() {
    try {
      setStatus('Menyinkronkan…');
      const url = `/api/time`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Gagal: ${res.status}`);
      const data = await res.json();
      if (!data.epochMs) throw new Error('Response tidak valid');

      baseEpochMs = data.epochMs;
      basePerf = performance.now();
      setStatus('Disinkronkan dari API', 'synced');
    } catch (err) {
      console.error(err);
      baseEpochMs = null;
      setStatus('❌ Gagal sinkronisasi API waktu', 'error');
    }
  }

  function render() {
    if (baseEpochMs == null) {
      requestAnimationFrame(render);
      return;
    }
    const nowMs = baseEpochMs + (performance.now() - basePerf);
    const date = new Date(nowMs);
    const val = {
      hour: String(date.getHours()).padStart(2, '0'),
      minute: String(date.getMinutes()).padStart(2, '0'),
      second: String(date.getSeconds()).padStart(2, '0'),
    };
    // Ambil persepuluhan detik (0–9)
    const ms = Math.floor(date.getMilliseconds() / 100);
    const text = `${val.hour}:${val.minute}:${val.second}:${ms}`;

    clockEl.textContent = text;
    document.title = text + ' — WIB';
    requestAnimationFrame(render);
  }

  syncTime();
  setInterval(syncTime, 10 * 60 * 1000);
  requestAnimationFrame(render);
})();
