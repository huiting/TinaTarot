"use strict";

const CACHE_NAME = "tina-tarot-offline-v3";
const CARD_FILES = ["世界The World.jpg","倒吊者The Hanged Man.jpg","力量Strength.jpg","命運之輪Wheel Of Fortune.jpg","太陽The Sun.jpg","女皇The Empress.jpg","女祭司The High Priestess.jpg","審判Judgement.jpg","寶劍AAce Of Swords.jpg","寶劍七Seven Of Swords.jpg","寶劍三Three Of Swords.jpg","寶劍九Nine Of Swords.jpg","寶劍二Two Of Swords.jpg","寶劍五Five Of Swords.jpg","寶劍侍從Page Of Swords.jpg","寶劍八Eight Of Swords.jpg","寶劍六Six Of Swords.jpg","寶劍十Ten Of Swords.jpg","寶劍四Four Of Swords.jpg","寶劍國王King Of Swords.jpg","寶劍王后Queen Of Swords.jpg","寶劍騎士Knight Of Swords.jpg","惡魔The Devil.jpg","愚人The Fool.jpg","戀人The Lovers.jpg","戰車The Chariot.jpg","星星The Stars.jpg","月亮The Moon.jpg","權杖AAce Of Wands.jpg","權杖七Seven Of Wands.jpg","權杖三Three Of Wands.jpg","權杖九Nine Of Wands.jpg","權杖二Two Of Wands.jpg","權杖五Five Of Wands.jpg","權杖侍從Page Of Wands.jpg","權杖八Eight Of Wands.jpg","權杖六Six Of Wands.jpg","權杖十Ten Of Wands.jpg","權杖四Four Of Wands.jpg","權杖國王King Of Wands.jpg","權杖王后Queen Of Wands.jpg","權杖騎士Knight Of Wands.jpg","正義Justice.jpg","死神Death.jpg","皇帝The Emperor.jpg","節制Temperance.jpg","聖盃AAce Of Cups.jpg","聖盃七Seven Of Cups.jpg","聖盃三Three Of Cups.jpg","聖盃九Nine Of Cups.jpg","聖盃二Two Of Cups.jpg","聖盃五Five Of Cups.jpg","聖盃侍從Page Of Cups.jpg","聖盃八Eight Of Cups.jpg","聖盃六Six Of Cups.jpg","聖盃十Ten Of Cups.jpg","聖盃四Four Of Cups.jpg","聖盃國王King Of Cups.jpg","聖盃王后Queen Of Cups.jpg","聖盃騎士Knight Of Cups.jpg","聖職者The Hierophant.jpg","錢幣AAce Of Pentacles.jpg","錢幣七Seven Of Pentacles.jpg","錢幣三Three Of Pentacles.jpg","錢幣九Nine Of Pentacles.jpg","錢幣二Two Of Pentacles.jpg","錢幣五Five Of Pentacles.jpg","錢幣侍從Page Of Pentacles.jpg","錢幣八Eight Of Pentacles.jpg","錢幣六Six Of Pentacles.jpg","錢幣十Ten Of Pentacles.jpg","錢幣四Four Of Pentacles.jpg","錢幣國王King Of Pentacles.jpg","錢幣王后Queen Of Pentacles.jpg","錢幣騎士Knight Of Pentacles.jpg","隱士The Hermit.jpg","高塔The Tower.jpg","魔術師The Magician.jpg"];
const cardURLs = CARD_FILES.map((name) =>
  new URL("./Tarot78/" + encodeURIComponent(name), self.registration.scope).href
);
const PRECACHE_URLS = [
  new URL("./", self.registration.scope).href,
  new URL("./index.html", self.registration.scope).href,
  new URL("./runes.html", self.registration.scope).href,
  new URL("./history.html", self.registration.scope).href,
  new URL("./manifest.webmanifest", self.registration.scope).href,
  new URL("./icons/icon-192.png", self.registration.scope).href,
  new URL("./icons/icon-512.png", self.registration.scope).href,
  new URL("./icons/apple-touch-icon.png", self.registration.scope).href,
  ...cardURLs
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith("tina-tarot-offline-") && name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestURL = new URL(request.url);
  if (requestURL.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      if (request.mode === "navigate") {
        const offlinePage = await cache.match(new URL("./index.html", self.registration.scope).href);
        if (offlinePage) return offlinePage;
      }
      return new Response("離線時找不到這個檔案。請先連上網路開啟塔羅抽卡，完成牌圖下載後再離線使用。", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  })());
});
