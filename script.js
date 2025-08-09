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

    // 4. Hàm chuyển đổi giao diện (ĐÃ TÍCH HỢP HISTORY API)
    function showAppView(url, fromHistory = false) {
        contentFrame.src = url;
        gridMenuView.classList.add('hidden');
        appView.classList.remove('hidden');
        // Chỉ thêm vào lịch sử nếu đây là hành động mới (không phải từ nút back)
        if (!fromHistory) {
            history.pushState({ view: 'app', appUrl: url }, '', window.location.pathname);
        }
    }

    function showGridView(fromHistory = false) {
        contentFrame.src = 'about:blank';
        appView.classList.add('hidden');
        gridMenuView.classList.remove('hidden');
        if (dropdownMenu) dropdownMenu.classList.add('hidden');
        
        // Nếu người dùng bấm nút "Bảng điều khiển" để quay về (không phải nút back của trình duyệt)
        // và đang ở trong một app, chúng ta sẽ đi lùi trong lịch sử.
        if (!fromHistory && history.state && history.state.view === 'app') {
            history.back();
        }
    }
    
    // 5. Hàm xử lý click chung cho các link
    function handleLinkClick(event, url) {
        event.preventDefault();
        const specialApps = ['quanlyblog.onrender.com', 'chat.pmtl.site'];
        const isSpecialApp = specialApps.some(appUrl => url.includes(appUrl));

        if (isSpecialApp) {
            window.location.href = url; // Chuyển hướng cho các app đặc biệt
        } else {
            showAppView(url); // Hiển thị app trong iframe và quản lý history
        }
    }

    // 6. Gán sự kiện (chỉ một lần để tránh lặp)
    if (!window.homePageListenersAttached) {
        gridLinks.forEach(link => {
            link.addEventListener('click', (e) => handleLinkClick(e, link.getAttribute('href')));
        });
        
        // *** PHẦN SỬA LỖI ***
        dropdownLinks.forEach(link => {
            // Chỉ gán sự kiện cho các link thực sự là ứng dụng,
            // bỏ qua nút "Bảng điều khiển" (vì nó đã có listener riêng).
            if (link.id !== 'back-to-grid-btn') {
                link.addEventListener('click', (e) => {
                    handleLinkClick(e, link.getAttribute('href'));
                    if (dropdownMenu) dropdownMenu.classList.add('hidden');
                });
            }
        });
        // *** KẾT THÚC PHẦN SỬA LỖI ***

        backToGridBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showGridView();
        });

        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
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

    // 7. LẮNG NGHE SỰ KIỆN NÚT BACK CỦA TRÌNH DUYỆT
    window.addEventListener('popstate', (event) => {
        if (event.state) {
            if (event.state.view === 'app') {
                showAppView(event.state.appUrl, true);
            } else {
                showGridView(true);
            }
        } else {
            // Xử lý trường hợp state là null (ví dụ: trang ban đầu)
            showGridView(true);
        }
    });
    
    // 8. Thiết lập trạng thái ban đầu cho trang
    // Nếu đang không ở trong app view, đảm bảo trạng thái history là 'grid'
    if (appView.classList.contains('hidden')) {
        history.replaceState({ view: 'grid' }, '', window.location.pathname);
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
    
    // Chạy khi trang được khôi phục từ cache (nhấn nút Back từ trang ngoài)
    window.addEventListener('pageshow', (event) => {
        // event.persisted là true khi trang được tải từ bfcache
        if (event.persisted) {
            console.log("Trang được khôi phục từ bfcache. Chạy lại setup.");
            // Chạy lại toàn bộ logic để đảm bảo trạng thái đúng
            setupHomePage();
        }
    });
}
