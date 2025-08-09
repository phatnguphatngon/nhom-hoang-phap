// --- BẮT ĐẦU PHẦN LOGIC MỚI ---

// Đóng gói toàn bộ logic của trang chủ vào một hàm duy nhất
function setupHomePage() {
    // 1. Kiểm tra đăng nhập
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = '/index.html';
        return; // Dừng thực thi nếu chưa đăng nhập
    }

    // 2. Đăng ký Service Worker (chỉ khi cần)
    if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker của trang chính đã được đăng ký:', registration);
            })
            .catch(err => {
                console.error('Lỗi đăng ký Service Worker của trang chính:', err);
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
    function handleLinkClick(event, url) {
        event.preventDefault();
        const specialApps = ['quanlyblog.onrender.com', 'chat.pmtl.site'];
        const isSpecialApp = specialApps.some(appUrl => url.includes(appUrl));

        if (isSpecialApp) {
            window.location.href = url;
        } else {
            showAppView(url);
            if (!dropdownMenu.classList.contains('hidden')) {
                 dropdownMenu.classList.add('hidden');
            }
        }
    }

    // Gán sự kiện (chỉ một lần để tránh lặp)
    if (!window.homePageListenersAttached) {
        gridLinks.forEach(link => {
            link.addEventListener('click', (e) => handleLinkClick(e, link.getAttribute('href')));
        });
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
        });
        dropdownLinks.forEach(link => {
            link.addEventListener('click', (e) => handleLinkClick(e, link.getAttribute('href')));
        });
        backToGridBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showGridView();
        });
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('isLoggedIn');
            window.location.href = '/index.html';
        });
        document.addEventListener('click', () => {
            if (dropdownMenu && !dropdownMenu.classList.contains('hidden')) {
                dropdownMenu.classList.add('hidden');
            }
        });
        window.homePageListenersAttached = true;
    }
}

// --- KẾT THÚC PHẦN LOGIC MỚI ---


// Logic chính để quyết định chạy mã nào dựa trên URL
const path = window.location.pathname;

if (path === '/' || path.endsWith('index.html')) {
    // LOGIC CHO TRANG ĐĂNG NHẬP
    document.addEventListener('DOMContentLoaded', () => {
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
    });
} else if (path.endsWith('home.html')) {
    // LOGIC CHO TRANG CHỦ
    // Chạy khi tải trang lần đầu
    document.addEventListener('DOMContentLoaded', setupHomePage);
    
    // Chạy khi trang được khôi phục từ cache (nhấn nút Back)
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            console.log("Trang được khôi phục từ bfcache. Chạy lại setup.");
            setupHomePage();
        }
    });
}
