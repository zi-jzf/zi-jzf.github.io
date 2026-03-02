/* =========================================
   Works Pages Scripts (Project Details)
   ========================================= */

/* --- 画像拡大機能 (Lightbox) --- */
const overlay = document.getElementById('lightbox-overlay');
const lightboxImg = document.getElementById('lightbox-img');

if (overlay && lightboxImg) {
    document.querySelectorAll('.zoomable').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            overlay.classList.add('active');
        });
    });

    overlay.addEventListener('click', () => {
        overlay.classList.remove('active');
    });
}
/* --- Sidebar Scroll Sync (Fixed Sticky Scroll) --- */
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.project-sidebar');
    if (!sidebar) return;

    window.addEventListener('scroll', () => {
        // Run only on desktop
        if (window.innerWidth <= 1200) {
            sidebar.style.transform = '';
            return;
        }

        const sidebarHeight = sidebar.offsetHeight;
        const windowHeight = window.innerHeight;
        const stickyTop = 150; // Defined in CSS (top: 150px)

        // Only apply effect if sidebar is taller than the visible sticky area
        const availableHeight = windowHeight - stickyTop;
        if (sidebarHeight > availableHeight) {

            // Calculate how far the sidebar *needs* to scroll to reach its own bottom
            const maxScrollDistance = sidebarHeight - availableHeight + 20; // +20px for bottom padding

            // As we scroll down the page, we move the sidebar UP by exactly the same amount
            // But we stop moving it up once its bottom edges into the viewport
            const scrollY = window.scrollY;
            const translateY = Math.min(scrollY, maxScrollDistance);

            sidebar.style.transform = `translateY(-${translateY}px)`;
        } else {
            // Reset if window gets resized and sidebar fits
            sidebar.style.transform = '';
        }
    }, { passive: true });

    // Trigger once on load
    window.dispatchEvent(new Event('scroll'));
});

/* --- Video Audio Control Script --- */
document.addEventListener('DOMContentLoaded', () => {
    // Event delegation for audio toggle buttons to ensure it works even if DOM changes
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.audio-toggle-btn');
        if (!btn) return;

        const block = btn.closest('.audio-toggle-block');
        if (!block) return;

        const video = block.querySelector('.audio-toggle-video');
        if (!video) return;

        // 動画の初期音量を少し下げておく（突然の大音量を防ぐため）
        video.volume = 0.4;
        const isMuted = video.muted;

        if (isMuted) {
            // 排他制御：現在再生中の他の動画を強制ミュートにする
            document.querySelectorAll('.audio-toggle-video').forEach(otherVideo => {
                if (otherVideo !== video && !otherVideo.muted) {
                    otherVideo.muted = true;
                    const otherBtn = otherVideo.closest('.audio-toggle-block').querySelector('.audio-toggle-btn');
                    if (otherBtn) {
                        otherBtn.classList.remove('active');
                        otherBtn.innerHTML = '<span class="icon">🔇</span> 音声をONにする';
                    }
                }
            });

            // この動画の音声をONにする
            video.muted = false;
            btn.classList.add('active');
            btn.innerHTML = '<span class="icon">🔊</span> 音声をOFFにする';
        } else {
            // この動画の音声をOFFにする（ミュート）
            video.muted = true;
            btn.classList.remove('active');
            btn.innerHTML = '<span class="icon">🔇</span> 音声をONにする';
        }
    });
});

