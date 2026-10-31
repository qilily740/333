(() => {
  const query = (window.IRIS_RELEASE ? `?iris-release=${encodeURIComponent(window.IRIS_RELEASE)}` : '?v=5.9.4-r2') + '&ui=music-guest-meting';
  const legacyKey = 'iris-v1';
  const databaseName = 'iris-local-data';
  const storeName = 'app-state';
  const scripts = ['scripts/media-storage.js', 'scripts/task-center.js', 'scripts/iris-assistant-chat.js', 'scripts/assistant-guide.js', 'scripts/layout-diagnostics.js', 'scripts/mini-theater.js', 'scripts/role-invitations.js', 'scripts/forum-core.js', 'scripts/market-core.js', 'scripts/perfumery-core.js', 'scripts/reading-core.js', 'scripts/reading-search.js', 'scripts/reading-content.js', 'scripts/timeline-core.js', 'scripts/growth-core.js', 'scripts/growth.js', 'scripts/earth-core.js', 'scripts/earth.js', 'scripts/travel-journal.js', 'scripts/travel-place-search.js', 'scripts/travel-map.js', 'scripts/travel-currency.js', 'scripts/travel-billing.js', 'scripts/travel-booking.js', 'scripts/people-core.js', 'scripts/people.js', 'scripts/if-world.js', 'scripts/experiences.js', 'scripts/backup-core.js', 'scripts/github-archive.js', 'scripts/github-sync-core.js', 'scripts/github-sync.js', 'scripts/guide-content.js', 'scripts/life-memory.js', 'scripts/vendor/qrcode.js', 'scripts/vendor/qrcode-utf8.js', 'scripts/music-core.js', 'scripts/music-cloud.js', 'scripts/music.js', 'scripts/app.js', 'scripts/forum.js', 'scripts/market.js', 'scripts/perfumery.js', 'scripts/reading-import.js', 'scripts/reading.js', 'scripts/profiles.js', 'scripts/importers.js', 'scripts/characters.js'];

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
    let blocked=false;
    const request = indexedDB.open(databaseName, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) {
        request.result.createObjectStore(storeName);
      }
    };
    request.onsuccess = () => {const database=request.result;if(blocked){database.close();return}database.onversionchange=()=>database.close();resolve(database)};
    request.onerror = () => reject(request.error || new Error('Could not open IndexedDB'));
    request.onblocked = () => {blocked=true;reject(Object.assign(new Error('请关闭同一地址的其他 Iris 旧页面，再重试打开。原有资料未被改动。'),{storageBlocked:true}))};
  });

  const requestValue = request => new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
  });

  const mediaWritten=new Set();let mediaStats=null;
  const hydrate=async(database,value)=>{
    if(value?.format!=='iris-local-media')return value;
    if(!window.IrisMediaStorage)throw new Error('图片存储模块未加载，已停止读取以保护数据。');
    const data=await window.IrisMediaStorage.unpack(value,async id=>{const record=await requestValue(database.transaction(storeName,'readonly').objectStore(storeName).get('media:'+id));mediaWritten.add(id);return record?.source});
    mediaStats=value.stats||null;return data;
  };
  const writeState = async(database,state,key='main')=>{
    const packed=window.IrisMediaStorage?await window.IrisMediaStorage.pack(state):{value:state,assets:new Map(),stats:null};
    await new Promise((resolve,reject)=>{const transaction=database.transaction(storeName,'readwrite'),store=transaction.objectStore(storeName);for(const [id,source] of packed.assets)if(!mediaWritten.has(id))store.put({source},'media:'+id);store.put(packed.value,key);transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error||new Error('IndexedDB save failed'));transaction.onabort=()=>reject(transaction.error||new Error('IndexedDB save was aborted'))});
    for(const id of packed.assets.keys())mediaWritten.add(id);if(key==='main')mediaStats=packed.stats;
  };

  const cloneSnapshot = value => typeof window.structuredClone === 'function' ? window.structuredClone(value) : JSON.parse(JSON.stringify(value));
  let saveTail = Promise.resolve();
  const storageApi = (mode, write, recovery) => ({
    mode,
    save(state) {
      const snapshot = cloneSnapshot(state);
      const task = saveTail.catch(() => {}).then(() => write(snapshot));
      saveTail = task;
      return task;
    },
    flush: () => saveTail,
    mediaInfo:()=>mediaStats,
    saveRecovery(state) {
      const snapshot = {createdAt:new Date().toISOString(),data:cloneSnapshot(state)};
      const task = saveTail.catch(() => {}).then(() => recovery.write(snapshot));
      saveTail = task;
      return task;
    },
    readRecovery: () => saveTail.catch(() => {}).then(() => recovery.read())
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
      saved=await hydrate(database,saved);
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
      window.IrisStorage = storageApi('indexeddb', value => writeState(database, value), {
        write: value => writeState(database, value, 'github-before-restore'),
        read: async() => hydrate(database,await requestValue(database.transaction(storeName, 'readonly').objectStore(storeName).get('github-before-restore')))
      });
      try { navigator.storage?.persist?.()?.catch?.(() => {}); } catch {}
      return saved;
    } catch (error) {
      database?.close();
      if(error.storageBlocked)throw error;
      if (readSucceeded) throw error;
      // A failed read is not an empty database. Never boot and save a blank state.
      if (!fallback) throw new Error('本地数据库暂时无法读取，原数据未被覆盖。请关闭其他 Iris 页面后重试。');
      window.IrisStorage = storageApi('localstorage-fallback', value => {
        localStorage.setItem(legacyKey, JSON.stringify(value));
      }, {
        write: value => localStorage.setItem('iris-github-before-restore', JSON.stringify(value)),
        read: () => JSON.parse(localStorage.getItem('iris-github-before-restore') || 'null')
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

  loadScript('scripts/media-storage.js').then(load).then(async saved => {
    window.IRIS_BOOT_STATE = saved && typeof saved === 'object' ? saved : {};
    await Promise.all(scripts.filter(src=>src!=='scripts/media-storage.js').map(loadScript));
  }).catch(error => {
    console.error('Iris startup failed', error);
    const panel = document.getElementById('irisBootScreen') || document.body;
    panel.replaceChildren();
    const message=document.createElement('p');message.textContent=error.message||'本地数据读取失败，已停止启动。';panel.append(message);
    const retry=document.createElement('button');retry.textContent='重试读取';retry.onclick=()=>location.reload();panel.append(retry);
  });
})();
