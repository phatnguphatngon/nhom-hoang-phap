    const CACHE_NAME = 'chat-app-cache-v1';
    const urlsToCache = [
      '/',
      '/index.html',
      '/manifest.json',
      // Thêm các tệp CSS, JS và hình ảnh khác của bạn vào đây
      'https://cdn.tailwindcss.com',
      'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js',
      'https://cdn.socket.io/4.6.1/socket.io.min.js',
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5.woff2', // Ví dụ font Inter
      // Thêm đường dẫn đến các icon bạn đã tạo
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png'
    ];

    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then((cache) => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
          })
      );
    });

    self.addEventListener('fetch', (event) => {
      event.respondWith(
        caches.match(event.request)
          .then((response) => {
            // Cache hit - return response
            if (response) {
              return response;
            }
            // If not in cache, fetch from network
            return fetch(event.request).catch(() => {
                // If network also fails, and it's a navigation request,
                // return a fallback page (e.g., offline.html)
                if (event.request.mode === 'navigate') {
                    // You might want to create an offline.html page
                    // return caches.match('/offline.html');
                }
                // For other requests, just throw the error
                throw new Error('Network request failed and no cache available.');
            });
          })
      );
    });

    self.addEventListener('activate', (event) => {
      const cacheWhitelist = [CACHE_NAME];
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheWhitelist.indexOf(cacheName) === -1) {
                return caches.delete(cacheName);
              }
            })
          );
        })
      );
    });

    // Push notification event listener
    self.addEventListener('push', (event) => {
        const data = event.data.json();
        console.log('Push received:', data);

        const title = data.title || 'Tin nhắn mới';
        const options = {
            body: data.body || 'Bạn có một tin nhắn mới.',
            icon: data.icon || '/icons/icon-192x192.png', // Sử dụng icon PWA của bạn
            badge: data.badge || '/icons/icon-192x192.png', // Icon nhỏ hơn cho một số nền tảng
            data: {
                url: data.url || '/' // URL để mở khi click vào thông báo
            }
        };

        event.waitUntil(self.registration.showNotification(title, options));
    });

    self.addEventListener('notificationclick', (event) => {
        event.notification.close(); // Đóng thông báo sau khi click

        event.waitUntil(
            clients.openWindow(event.notification.data.url) // Mở URL khi click
        );
    });
    