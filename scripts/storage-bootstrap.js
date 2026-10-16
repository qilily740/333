(() => {
  const query = window.IRIS_RELEASE ? `?iris-release=${encodeURIComponent(window.IRIS_RELEASE)}` : '';
  const legacyKey = 'iris-v1';
  const databaseName = 'iris-local-data';
  const storeName = 'app-state';

  const readLegacyState = () => {
    try {
      const value = localStorage.getItem(legacyKey);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
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

  const load = async () => {
    let database;
    try {
      database = await openDatabase();
      let saved = await requestValue(database.transaction(storeName, 'readonly').objectStore(storeName).get('main'));
      if (!saved) {
        saved = readLegacyState();
        if (saved) await writeState(database, saved);
      }
      try { localStorage.removeItem(legacyKey); } catch {}
      window.IrisStorage = {
        mode: 'indexeddb',
        save(state) {
          return writeState(database, JSON.parse(JSON.stringify(state)));
        }
      };
      try {
        const persistence = navigator.storage?.persist?.();
        persistence?.catch?.(() => {});
      } catch {}
      return saved;
    } catch (error) {
      database?.close();
      window.IrisStorage = {
        mode: 'localstorage-fallback',
        save(state) {
          try {
            localStorage.setItem(legacyKey, JSON.stringify(state));
            return Promise.resolve();
          } catch (fallbackError) {
            return Promise.reject(fallbackError);
          }
        }
      };
      return readLegacyState();
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
    await Promise.all(['scripts/mini-theater.js', 'scripts/role-invitations.js', 'scripts/forum-core.js', 'scripts/market-core.js', 'scripts/perfumery-core.js', 'scripts/reading-core.js', 'scripts/reading-search.js', 'scripts/reading-content.js', 'scripts/backup-core.js', 'scripts/app.js', 'scripts/forum.js', 'scripts/market.js', 'scripts/perfumery.js', 'scripts/reading-import.js', 'scripts/reading.js', 'scripts/profiles.js', 'scripts/importers.js', 'scripts/characters.js'].map(loadScript));
  }).catch(error => {
    console.error('Iris startup failed', error);
    window.IRIS_BOOT_STATE = {};
  });
})();
