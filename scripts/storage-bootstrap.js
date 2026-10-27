(() => {
  const query = window.IRIS_RELEASE ? `?iris-release=${encodeURIComponent(window.IRIS_RELEASE)}` : '?v=5.9.1-r1';
  const legacyKey = 'iris-v1';
  const databaseName = 'iris-local-data';
  const storeName = 'app-state';
  const scripts = ['scripts/layout-diagnostics.js', 'scripts/mini-theater.js', 'scripts/role-invitations.js', 'scripts/forum-core.js', 'scripts/market-core.js', 'scripts/perfumery-core.js', 'scripts/reading-core.js', 'scripts/reading-search.js', 'scripts/reading-content.js', 'scripts/timeline-core.js', 'scripts/growth-core.js', 'scripts/growth.js', 'scripts/earth-core.js', 'scripts/earth.js', 'scripts/travel-journal.js', 'scripts/travel-map.js', 'scripts/travel-currency.js', 'scripts/travel-billing.js', 'scripts/travel-booking.js', 'scripts/people-core.js', 'scripts/people.js', 'scripts/if-world.js', 'scripts/experiences.js', 'scripts/backup-core.js', 'scripts/guide-content.js', 'scripts/life-memory.js', 'scripts/vendor/qrcode.js', 'scripts/vendor/qrcode-utf8.js', 'scripts/music-core.js', 'scripts/music-cloud.js', 'scripts/music.js', 'scripts/app.js', 'scripts/forum.js', 'scripts/market.js', 'scripts/perfumery.js', 'scripts/reading-import.js', 'scripts/reading.js', 'scripts/profiles.js', 'scripts/importers.js', 'scripts/characters.js'];

  // Fetch the application bundle while IndexedDB is opening so storage latency
  // does not delay the start of every script request.
  for (const src of scripts) {
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'script';
    preload.href = `${src}${query}`;
    document.head.append(preload);
  }

  const readLegacyState = () => {
    try {
      const value = localStorage.getItem(legacyKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      throw new Error('备用数据无法读取，已停止启动以保护原数据。');
    }
  };

  const openDatabase = () => new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is unavailable'));
      return;
    }
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) {
        request.result.createObjectStore(storeName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open IndexedDB'));
    request.onblocked = () => reject(new Error('IndexedDB upgrade is blocked'));
  });

  const requestValue = request => new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
  });

  const writeState = (database, state) => new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).put(state, 'main');
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB save failed'));
    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB save was aborted'));
  });

  let saveTail = Promise.resolve();
  const storageApi = (mode, write) => ({
    mode,
    save(state) {
      const snapshot = JSON.parse(JSON.stringify(state));
      const task = saveTail.catch(() => {}).then(() => write(snapshot));
      saveTail = task;
      return task;
    },
    flush: () => saveTail
  });
  const chooseRecovery = (primary, fallback) => new Promise(resolve => {
    const panel = document.getElementById('irisBootScreen') || document.body;
    panel.replaceChildren();
    const title = document.createElement('p');
    title.textContent = '发现两份不同的本地数据，请选择本次打开的版本。两份原始数据都会保留，不会自动合并或删除。';
    panel.append(title);
    for (const [label, value] of [['打开原数据库资料', primary], ['打开备用存储资料', fallback]]) {
      const button = document.createElement('button');button.textContent = label;
      button.onclick = () => { panel.replaceChildren(); resolve(value); };panel.append(button);
    }
    const download = document.createElement('button');download.textContent = '导出两份原始数据';
    download.onclick = () => { const url=URL.createObjectURL(new Blob([JSON.stringify({primary,fallback},null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='iris-storage-recovery.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000); };panel.append(download);
  });
  const load = async () => {
    let database, readSucceeded = false;
    let fallback, fallbackError;
    try { fallback = readLegacyState(); } catch (error) { fallbackError = error; }
    try {
      database = await openDatabase();
      let saved = await requestValue(database.transaction(storeName, 'readonly').objectStore(storeName).get('main'));
      readSucceeded = true;
      if (!saved && fallbackError) throw fallbackError;
      if (saved && fallback && JSON.stringify(saved) !== JSON.stringify(fallback)) {
        // Keep both originals in the same atomic database transaction before proceeding.
        const recoveryId = 'recovery-' + Date.now();
        await new Promise((resolve,reject) => {
          const tx=database.transaction(storeName,'readwrite'),store=tx.objectStore(storeName);
          store.put(saved,recoveryId+'-primary');store.put(fallback,recoveryId+'-fallback');
          tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(tx.error||new Error('恢复副本保存失败'));
        });
        saved = await chooseRecovery(saved, fallback);
        await writeState(database, saved);
      } else if (!saved && fallback) {
        saved = fallback;
        await writeState(database, saved);
      }
      // Only remove the legacy copy after a successful read/migration/recovery write.
      if (!fallbackError) try { localStorage.removeItem(legacyKey); } catch {}
      window.IrisStorage = storageApi('indexeddb', value => writeState(database, value));
      try { navigator.storage?.persist?.()?.catch?.(() => {}); } catch {}
      return saved;
    } catch (error) {
      database?.close();
      if (readSucceeded) throw error;
      // A failed read is not an empty database. Never boot and save a blank state.
      if (!fallback) throw new Error('本地数据库暂时无法读取，原数据未被覆盖。请关闭其他 Iris 页面后重试。');
      window.IrisStorage = storageApi('localstorage-fallback', value => {
        localStorage.setItem(legacyKey, JSON.stringify(value));
      });
      return fallback;
    }
  };

  const loadScript = src => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    // Start every download at once while preserving the dependency order below.
    script.async = false;
    script.src = `${src}${query}`;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.body.append(script);
  });

  load().then(async saved => {
    window.IRIS_BOOT_STATE = saved && typeof saved === 'object' ? saved : {};
    await Promise.all(scripts.map(loadScript));
  }).catch(error => {
    console.error('Iris startup failed', error);
    const panel = document.getElementById('irisBootScreen') || document.body;
    panel.replaceChildren();
    const message=document.createElement('p');message.textContent=error.message||'本地数据读取失败，已停止启动。';panel.append(message);
    const retry=document.createElement('button');retry.textContent='重试读取';retry.onclick=()=>location.reload();panel.append(retry);
  });
})();
