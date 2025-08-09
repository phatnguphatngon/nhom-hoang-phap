// service-worker.js for the main login application

// Sự kiện 'install': được gọi khi service worker được cài đặt lần đầu.
self.addEventListener('install', (event) => {
  console.log('Service Worker của trang chính đang được cài đặt.');
  // Bỏ qua việc chờ đợi để kích hoạt service worker mới ngay lập tức.
  self.skipWaiting();
});

// Sự kiện 'activate': được gọi khi service worker được kích hoạt.
self.addEventListener('activate', (event) => {
  console.log('Service Worker của trang chính đã được kích hoạt.');
  // Đảm bảo service worker mới kiểm soát trang ngay lập tức.
  event.waitUntil(self.clients.claim());
});

// Sự kiện 'push': đây là phần quan trọng nhất, xử lý khi nhận được thông báo đẩy.
self.addEventListener('push', (event) => {
  console.log('[Service Worker Chính] Đã nhận Push Event.');
  
  let data = {};
  try {
    // Cố gắng phân tích dữ liệu push dưới dạng JSON.
    data = event.data.json();
  } catch (e) {
    // Nếu không phải JSON, lấy dưới dạng văn bản.
    data = {
      title: 'Thông báo mới',
      body: event.data.text(),
    };
  }

  const title = data.title || 'Thông báo mới';
  const options = {
    body: data.body || 'Bạn có một tin nhắn mới.',
    icon: data.icon || '/logo.png', // Sử dụng logo của bạn làm icon mặc định
    badge: data.badge || '/logo.png',
    data: {
        // URL sẽ được mở khi người dùng nhấp vào thông báo
        url: data.url || '/' 
    }
  };

  // Yêu cầu trình duyệt hiển thị thông báo.
  event.waitUntil(self.registration.showNotification(title, options));
});

// Sự kiện 'notificationclick': xử lý khi người dùng nhấp vào thông báo.
self.addEventListener('notificationclick', (event) => {
    // Đóng thông báo lại.
    event.notification.close();
    
    const urlToOpen = event.notification.data.url;

    // Cố gắng tìm và focus vào một tab đang mở của ứng dụng.
    // Nếu không tìm thấy, mở một cửa sổ mới.
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                // Nếu đã có tab đang mở ở trang chủ, focus vào nó.
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Nếu không, mở cửa sổ mới.
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen || '/');
            }
        })
    );
});
