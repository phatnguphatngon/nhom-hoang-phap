document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // LOGIC CHO TRANG ĐĂNG NHẬP (index.html)
    if (path === '/' || path.endsWith('index.html')) {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const email = loginForm.email.value;
                const password = loginForm.password.value;
                const errorMessage = document.getElementById('errorMessage');
                errorMessage.textContent = '';

                try {
                    const response = await fetch('/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });
                    const result = await response.json();
                    if (response.ok) {
                        sessionStorage.setItem('isLoggedIn', 'true');
                        window.location.href = '/home.html';
                    } else {
                        errorMessage.textContent = result.message;
                    }
                } catch (error) {
                    errorMessage.textContent = 'Đã có lỗi xảy ra.';
                }
            });
        }
    }
    // LOGIC CHO TRANG CHỦ (home.html)
    else if (path.endsWith('home.html')) {
        // 1. Kiểm tra đăng nhập
        if (sessionStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = '/index.html';
            return;
        }

        // *** LOGIC MỚI: ĐĂNG KÝ SERVICE WORKER CHO TRANG CHÍNH ***
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('Service Worker của trang chính đã được đăng ký:', registration);
                    })
                    .catch(err => {
                        console.error('Lỗi đăng ký Service Worker của trang chính:', err);
                    });
            });
        }
        // *** KẾT THÚC LOGIC MỚI ***

        // 2. Lấy các phần tử DOM
        const gridMenuView = document.getElementById('grid-menu-view');
        const appView = document.getElementById('app-view');
        const contentFrame = document.getElementById('contentFrame');
        const menuToggleBtn = document.getElementById('menu-toggle-btn');
        const dropdownMenu = document.getElementById('dropdown-menu');
        const gridLinks = gridMenuView.querySelectorAll('.menu-card');
        const dropdownLinks = dropdownMenu.querySelectorAll('.dropdown-link');
        const backToGridBtn = document.getElementById('back-to-grid-btn');
        const logoutButton = document.getElementById('logoutButton');

        // 3. Hàm chuyển đổi giao diện
        function showAppView(url) {
            contentFrame.src = url;
            gridMenuView.classList.add('hidden');
            appView.classList.remove('hidden');
        }

        function showGridView() {
            contentFrame.src = 'about:blank';
            appView.classList.add('hidden');
            gridMenuView.classList.remove('hidden');
            dropdownMenu.classList.add('hidden');
        }
        
        // 4. Hàm xử lý click chung cho các link
        async function handleLinkClick(event, url) {
            event.preventDefault();
            const isBlogApp = url.includes('quanlyblog.onrender.com');
            const isChatApp = url.includes('chat.pmtl.site');

            if (isBlogApp) {
                window.location.href = url;
                return;
            }

            if (isChatApp) {
                if ('Notification' in window && Notification.permission === 'default') {
                    await Notification.requestPermission();
                }
            }
            
            showAppView(url);
            if (!dropdownMenu.classList.contains('hidden')) {
                 dropdownMenu.classList.add('hidden');
            }
        }

        // 5. Gán sự kiện cho các thẻ trong Grid Menu
        gridLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                handleLinkClick(e, link.getAttribute('href'));
            });
        });

        // 6. Gán sự kiện cho nút Menu ẩn
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
        });

        // 7. Gán sự kiện cho các link trong Dropdown
        dropdownLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                handleLinkClick(e, link.getAttribute('href'));
            });
        });

        // 8. Gán sự kiện cho nút "Bảng điều khiển" (quay về Grid)
        backToGridBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showGridView();
        });

        // 9. Gán sự kiện cho nút Đăng xuất
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('isLoggedIn');
            window.location.href = '/index.html';
        });
        
        // 10. Đóng dropdown khi click ra ngoài
        document.addEventListener('click', () => {
            if (!dropdownMenu.classList.contains('hidden')) {
                dropdownMenu.classList.add('hidden');
            }
        });
    }
});
