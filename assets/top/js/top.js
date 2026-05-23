/* =========================================
   Top Page Scripts (index.html)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    /* --- 1. Worksのフィルター機能 --- */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const workItems = document.querySelectorAll('.work-item');

    // 各アイテムの元の transition-delay をデータ属性に保存しておく
    workItems.forEach(item => {
        const originalDelay = item.style.transitionDelay || '0s';
        item.dataset.originalDelay = originalDelay;
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // ボタンの色を切り替え
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');
            const isAll = filterValue === 'all';

            // アイテムの表示・非表示
            workItems.forEach(item => {
                const itemCategories = item.getAttribute('data-category');

                if (filterValue === 'all' || (itemCategories && itemCategories.includes(filterValue))) {
                    item.classList.remove('hidden');

                    if (isAll) {
                        // "All"に戻した場合:
                        // transitionを一瞬無効化して opacity:0 の初期状態をブラウザに確定させる。
                        // こうしないと「active除去→reveal()でactive即再付与」の間に
                        // 再描画が入らずアニメーションが省略される。
                        item.style.transition = 'none';
                        item.style.transitionDelay = '0s';
                        item.classList.remove('active');

                        // getBoundingClientRect() で強制リフロー → ブラウザが opacity:0 を確定する
                        void item.getBoundingClientRect();

                        // transition と delay を本来の値に戻す
                        item.style.transition = '';
                        item.style.transitionDelay = item.dataset.originalDelay;

                        // reveal() に委ねる（画面内ならアニメーションで表示、画面外は後でスクロールで表示）
                        requestAnimationFrame(() => reveal());
                    } else {
                        // フィルター時: アニメーション遅延を0にして即時表示
                        item.style.transitionDelay = '0s';
                        item.classList.add('active');
                    }
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

/* --- 6. 低電力モード対策: 動画再生失敗時のフォールバック --- */
/* iOSの低電力モードではautoplayがブロックされ、poster画像の代わりに
   グレーの再生ボタンが表示されてしまう問題に対処する。
   play()はPromiseを返すため、rejectされたら動画を非表示にし
   静止画（フォールバックimg）に切り替える。 */
document.addEventListener('DOMContentLoaded', () => {
    const videoBg = document.querySelector('.video-background');
    const bgVideo = videoBg ? videoBg.querySelector('video') : null;

    if (bgVideo) {
        // autoplay属性があっても明示的にplay()を呼ぶことでPromiseを取得
        const playPromise = bgVideo.play();

        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // 再生失敗（低電力モード、ポリシー制限等）:
                // 親要素にクラスを付与 → CSS側でvideoを隠しimgを表示
                videoBg.classList.add('video-failed');

                // ガラステキスト内の複製動画（.blurred-video）も非表示にする
                // 再生ボタンがテキスト内に見えてしまうのを防ぐ
                // ※アウトラインSVG(.glass-highlight-stroke)は残るのでテキストは消えない
                document.querySelectorAll('.blurred-video').forEach(v => {
                    v.style.display = 'none';
                });
            });
        }
    }
});

