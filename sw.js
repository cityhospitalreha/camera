// キャッシュ(保存領域)の名前。中身を変えて再公開したときは、この末尾の数字を
// 1つ増やすと、古いキャッシュが破棄されて新しい内容に確実に更新されます
const CACHE_NAME = 'mosaic-stamp-v31';

// 起動に必要な最低限のファイル一式
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './offline-step1.jpg',
  './offline-step2.png'
];

// インストール時:必要なファイルをまとめて保存(キャッシュ)する
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 有効化時:古いバージョンのキャッシュが残っていたら削除する
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ページから何か読み込もうとするたび:
// まずネットから最新版を取りに行く(オンラインなら常に最新の内容になる)。
// 取れたら保存(キャッシュ)し直しておき、ネットに繋がらないときだけ
// その保存済みの内容を使う(オフライン対応)。
// ※以前は「保存済みがあれば必ずそれを使う」方式だったため、
//   一度保存された古い内容がずっと表示され続けてしまっていた。
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
