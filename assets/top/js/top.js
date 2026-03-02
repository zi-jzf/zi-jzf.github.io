/* =========================================
   Top Page Scripts (index.html)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    /* --- 1. Worksのフィルター機能 --- */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const workItems = document.querySelectorAll('.work-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // ボタンの色を切り替え
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            // アイテムの表示・非表示
            workItems.forEach(item => {
                const itemCategories = item.getAttribute('data-category');

                if (filterValue === 'all' || (itemCategories && itemCategories.includes(filterValue))) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });

    /* --- 2. ヘッダーの色反転 --- */
    const header = document.querySelector('header');
    const worksSection = document.querySelector('.works-section');

    if (worksSection && header) {
        const checkHeaderColor = () => {
            // worksSectionの上端が、画面上部から50pxのラインを越えたら反転
            if (worksSection.getBoundingClientRect().top <= 50) {
                // Worksセクションに入った -> 黒モードON
                header.classList.add('dark-mode');
            } else {
                // Worksセクションから出た -> 黒モードOFF (白文字に戻る)
                header.classList.remove('dark-mode');
            }
        };

        // スクロール時と画面リサイズ時に判定
        window.addEventListener('scroll', checkHeaderColor, { passive: true });
        window.addEventListener('resize', checkHeaderColor, { passive: true });
        // 初回ロード時にも判定
        checkHeaderColor();
    }
});

/* --- 3. URLパラメータ受け取り機能 --- */
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const targetFilter = params.get('filter');

    if (targetFilter) {
        const targetBtn = document.querySelector(`.filter-btn[data-filter="${targetFilter}"]`);

        if (targetBtn) {
            targetBtn.click();
            const worksEl = document.getElementById('works');
            if (worksEl) {
                worksEl.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
});
