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

/* --- 3. Heroアニメーション起動 --- */
document.addEventListener('loaderExited', () => {
    document.body.classList.add('hero-animated');
});

/* --- 4. URLパラメータ受け取り機能 --- */
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

/* --- 5. Worksセクションの拡大アニメーション --- */
document.addEventListener('DOMContentLoaded', () => {
    const worksSectionNode = document.querySelector('.works-section');
    if (worksSectionNode) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 画面内に入ったらクラスを付与して広がる
                    worksSectionNode.classList.add('is-expanded');
                } else {
                    // 画面外に出た時、要素が画面の下に消えた場合（上にスクロールして戻った場合）にのみリセット
                    // boundingClientRect.top が window.innerHeight より大きい場合は画面下にいる
                    if (entry.boundingClientRect.top >= window.innerHeight - 100) {
                        worksSectionNode.classList.remove('is-expanded');
                    }
                }
            });
        }, {
            // 要素が画面に少し（10%）見えたタイミングで発火
            threshold: 0.1
        });

        observer.observe(worksSectionNode);
    }
});
