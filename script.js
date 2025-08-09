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

        // 2. Đăng ký Service Worker cho trang chính
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

        // 3. Lấy các phần tử DOM
        const gridMenuView = document.getElementById('grid-menu-view');
        const appView = document.getElementById('app-view');
        const contentFrame = document.getElementById('contentFrame');
        const menuToggleBtn = document.getElementById('menu-toggle-btn');
        const dropdownMenu = document.getElementById('dropdown-menu');
        const gridLinks = gridMenuView.querySelectorAll('.menu-card');
        const dropdownLinks = dropdownMenu.querySelectorAll('.dropdown-link');
        const backToGridBtn = document.getElementById('back-to-grid-btn');
        const logoutButton = document.getElementById('logoutButton');

        // 4. Hàm chuyển đổi giao diện
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
        
        // 5. Hàm xử lý click chung cho các link
        async function handleLinkClick(event, url) {
            event.preventDefault();
            // Các ứng dụng cần quyền đặc biệt hoặc cần đăng nhập riêng
            const specialApps = ['quanlyblog.onrender.com', 'chat.pmtl.site'];
            
            const isSpecialApp = specialApps.some(appUrl => url.includes(appUrl));

            if (isSpecialApp) {
                // Nếu là ứng dụng đặc biệt, chuyển hướng cả trang
                window.location.href = url;
            } else {
                // Với các ứng dụng khác, tải vào iframe
                showAppView(url);
                if (!dropdownMenu.classList.contains('hidden')) {
                     dropdownMenu.classList.add('hidden');
                }
            }
        }

        // Gán sự kiện cho các thẻ trong Grid Menu
        gridLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                handleLinkClick(e, link.getAttribute('href'));
            });
        });

        // Gán sự kiện cho nút Menu ẩn
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
        });

        // Gán sự kiện cho các link trong Dropdown
        dropdownLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                handleLinkClick(e, link.getAttribute('href'));
            });
        });

        // Gán sự kiện cho nút "Bảng điều khiển" (quay về Grid)
        backToGridBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showGridView();
        });

        // Gán sự kiện cho nút Đăng xuất
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('isLoggedIn');
            window.location.href = '/index.html';
        });
        
        // Đóng dropdown khi click ra ngoài
        document.addEventListener('click', () => {
            if (!dropdownMenu.classList.contains('hidden')) {
                dropdownMenu.classList.add('hidden');
            }
        });
    }
});
