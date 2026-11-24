export const DB_NAME = 'blueleaf-offline-db';
export const STORE_NAME = 'books';
export const DB_VERSION = 1;

function getDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: ['bookId', 'source'] });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveBookOffline(bookId: string, source: string, content: string): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put({ bookId, source, content });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getBookOffline(bookId: string, source: string): Promise<string | null> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get([bookId, source]);
    request.onsuccess = () => {
      resolve(request.result ? request.result.content : null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function removeBookOffline(bookId: string, source: string): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete([bookId, source]);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function listOfflineBooks(): Promise<Array<{bookId: string, source: string}>> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const result = request.result.map((item: { bookId: string; source: string }) => ({ bookId: item.bookId, source: item.source }));
      resolve(result);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function isBookOffline(bookId: string, source: string): Promise<boolean> {
  const content = await getBookOffline(bookId, source);
  return content !== null;
}
