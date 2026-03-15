// loader.js
(function () {
    /**
     * Loader UIとDOM操作を担当するオブジェクト
     */
    const LoaderUI = {
        loader: null,
        textElement: null,
        subTextElement: null,
        blinkInterval: null,

        init() {
            // CSSの注入
            const style = document.createElement('style');
            style.textContent = `
                #global-loader {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: #cce0ee;
                    z-index: 99999;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    /* 背景のちらつき防止(ハードウェアアクセラレーション) */
                    will-change: transform;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;

                    /* 動きのあるトランジションを追加 */
                    transition: transform 0.6s cubic-bezier(0.85, 0, 0.15, 1), opacity 0.4s ease-out, visibility 0.4s ease-out;
                    color: #071641;
                    font-family: var(--font-en, 'Bricolage Grotesque', sans-serif);
                    font-size: 2.5rem;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    pointer-events: none;
                }
                
                /* 状態ごとのクラス (右から入って、左に抜ける) */
                #global-loader.slide-in-right {
                    transform: translateX(100%); /* 右外で待機 */
                }
                #global-loader.slide-center {
                    transform: translateX(0); /* 画面中央 */
                }
                #global-loader.slide-out-left {
                    transform: translateX(-100%); /* 左外へ退出 */
                }
                #global-loader.slide-out-up {
                    transform: translateY(-100%); /* 上へ退出 */
                }
                #global-loader.hidden {
                    opacity: 0;
                    visibility: hidden;
                }

                .loader-text {
                    display: inline-block;
                    min-width: 15ch;
                    text-align: center;
                    white-space: nowrap;
                    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    margin-bottom: 10px;
                    font-family: var(--font-en, 'Bricolage Grotesque', sans-serif);
                }
                @supports (-webkit-touch-callout: none) {
                    .loader-text {
                        font-family: system-ui, -apple-system, sans-serif;
                    }
                }
                .loader-subtext {
                    font-size: 1.1rem;
                    font-weight: 500;
                    letter-spacing: 0.2em;
                    color: rgba(7, 22, 65, 0.6);
                    text-transform: lowercase;
                    text-align: center;
                }
                .loading-dots {
                    display: inline-block;
                    width: 3ch;
                    text-align: left;
                }
                #loader-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                @media (max-width: 600px) {
                    #global-loader {
                        font-size: 1.8rem;
                    }
                }
            `;
            document.head.appendChild(style);

            // DOM要素の生成
            this.loader = document.createElement('div');
            this.loader.id = 'global-loader';
            this.loader.classList.add('slide-center'); // 初期状態は中央

            const container = document.createElement('div');
            container.id = 'loader-container';

            this.textElement = document.createElement('div');
            this.textElement.className = 'loader-text';
            this.textElement.textContent = '( x _ x )';

            this.subTextElement = document.createElement('div');
            this.subTextElement.className = 'loader-subtext';
            this.subTextElement.innerHTML = 'loading<span class="loading-dots">.</span>';

            container.appendChild(this.textElement);
            container.appendChild(this.subTextElement);
            this.loader.appendChild(container);

            if (!document.getElementById('global-loader')) {
                // スクリプトが <head> で実行中で、まだ document.body が存在しない場合への対応
                if (document.body) {
                    document.body.prepend(this.loader);
                } else {
                    // HTML全体(documentElement)の末尾に一旦追加し、初期の描画をカバーする
                    document.documentElement.appendChild(this.loader);

                    // bodyが構築された瞬間に、正しい位置(bodyの先頭)へ移動する
                    const observer = new MutationObserver(() => {
                        if (document.body) {
                            document.body.prepend(this.loader);
                            observer.disconnect();
                        }
                    });
                    observer.observe(document.documentElement, { childList: true });
                }
            }
        },

        setText(faceText) {
            if (this.textElement) this.textElement.textContent = faceText;
        },

        setSubText(text) {
            if (this.subTextElement) this.subTextElement.innerHTML = text;
        },

        setScale(scale) {
            if (this.textElement) this.textElement.style.transform = `scale(${scale})`;
        },

        startBlinking() {
            let dotCount = 1;
            this.blinkInterval = setInterval(() => {
                dotCount = (dotCount % 3) + 1;
                const dotsSpan = this.subTextElement.querySelector('.loading-dots');
                if (dotsSpan) dotsSpan.textContent = '.'.repeat(dotCount);
            }, 400);
        },

        stopBlinking() {
            if (this.blinkInterval) {
                clearInterval(this.blinkInterval);
                this.blinkInterval = null;
            }
        },

        slideInFromRight() {
            // トランジション（アニメーション）を一時的に無効化
            this.loader.style.transition = 'none';

            // クラスをリセットし、ローダーを「右画面外」へ瞬時にワープさせる
            this.loader.classList.remove('hidden', 'slide-out-left', 'slide-out-up', 'slide-center');
            this.loader.classList.add('slide-in-right');

            // ブラウザに現在の状態（右にいること）を強制的に再計算させる（リフロー）
            void this.loader.offsetWidth;

            // トランジションを有効化して、中央へスライドさせる
            this.loader.style.transition = '';
            this.loader.classList.remove('slide-in-right');
            this.loader.classList.add('slide-center');
        },

        slideOutToLeft(delay = 0) {
            setTimeout(() => {
                this.loader.classList.remove('slide-center');
                this.loader.classList.add('slide-out-left');
                document.dispatchEvent(new Event('loaderExited'));
                // 完了後に完全に隠す
                setTimeout(() => { this.loader.classList.add('hidden'); }, 600);
            }, delay);
        },

        slideOutToTop(delay = 0) {
            setTimeout(() => {
                this.loader.classList.remove('slide-center');
                this.loader.classList.add('slide-out-up');
                document.dispatchEvent(new Event('loaderExited'));
                // 完了後に完全に隠す
                setTimeout(() => { this.loader.classList.add('hidden'); }, 600);
            }, delay);
        },

        hideInstantly() {
            this.loader.classList.remove('slide-center', 'slide-in-right', 'slide-out-left', 'slide-out-up');
            this.loader.classList.add('hidden');
            document.dispatchEvent(new Event('loaderExited'));
        }
    };

    /**
     * 初回アクセス時のフルアニメーションを担当するオブジェクト
     */
    const InitialAnimation = {
        run(onComplete) {
            LoaderUI.startBlinking();

            setTimeout(() => LoaderUI.setText('( ^ _ ^ )'), 200);
            setTimeout(() => LoaderUI.setText('☆-( - _ ^ )'), 600);
            setTimeout(() => LoaderUI.setText('( ^ _ ^ )'), 1000);
            setTimeout(() => LoaderUI.setText('( ^ _ - )-☆'), 1400);
            setTimeout(() => {
                LoaderUI.setText('( - _ - )'); // 待機中
                onComplete();
            }, 2000); // 2000msで完了コールバック
        },

        finish() {
            LoaderUI.stopBlinking();
            sessionStorage.setItem('hasSeenLoader', 'true');

            LoaderUI.setText('( ^ _ ^ )!');
            LoaderUI.setScale(1.2);
            LoaderUI.setSubText('completed!');

            setTimeout(() => {
                LoaderUI.setText('( ^ _ ^ ) v'); // ピースサイン
                LoaderUI.setScale(1);

                setTimeout(() => {
                    LoaderUI.slideOutToTop(); // 初回は上へ幕が上がるように退出
                }, 400);
            }, 300);
        }
    };

    /**
     * ページ間をまたぐスライド遷移を担当するオブジェクト
     */
    const SlideTransition = {
        isTransitioning: false,

        // リンクをクリックして別のページへ行く時の処理（右から入ってくる）
        onLinkClick(e) {
            const link = e.target.closest('a');
            if (!link) return;

            const targetUrl = link.getAttribute('href');
            const target = link.getAttribute('target');

            if (SlideTransition.isTransitioning || !targetUrl || targetUrl.startsWith('#') || targetUrl.startsWith('javascript') || target === '_blank') {
                return;
            }

            e.preventDefault();
            SlideTransition.isTransitioning = true;

            LoaderUI.setText('\\(^ _ ^ )'); // 右から入ってくる顔
            LoaderUI.setSubText('');
            LoaderUI.stopBlinking();

            LoaderUI.slideInFromRight();
            sessionStorage.setItem('navigatingInternal', 'true');

            // 0.6秒後に遷移実行
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 600);
        },

        // 別のページから遷移してきた時の処理（左へ抜けていく）
        onPageEnter() {
            LoaderUI.slideOutToLeft(400); // すぐにスライドさせて消す
        }
    };

    /**
     * メインコントローラー（アプリの初期化と状態管理）
     */
    const LoaderCore = {
        minTimeElapsed: false,
        pageLoaded: false,
        finished: false,
        isFirstVisit: false,
        isFromInternalLink: false,

        init() {
            // 遷移時に画面が一瞬ちらつく（FOUC）現象を防ぐため、
            // DOMContentLoadedを待たずに即座にUIを生成して表示する
            LoaderUI.init();
            this.checkState();

            // ロード監視
            this.watchLoad();

            // BFCache (戻るボタン) 対策
            window.addEventListener('pageshow', (event) => {
                if (event.persisted) {
                    LoaderUI.hideInstantly();
                    SlideTransition.isTransitioning = false;
                }
            });

            // クリックの監視
            document.addEventListener('click', SlideTransition.onLinkClick);
        },

        checkState() {
            // Performance APIでリロードかを判定
            let isReload = false;
            if (window.performance && window.performance.getEntriesByType) {
                const navEntries = window.performance.getEntriesByType('navigation');
                if (navEntries.length > 0 && navEntries[0].type === 'reload') {
                    isReload = true;
                }
            }

            this.isFirstVisit = !sessionStorage.getItem('hasSeenLoader') || isReload;
            this.isFromInternalLink = sessionStorage.getItem('navigatingInternal') === 'true';

            if (this.isFromInternalLink) {
                // 内部リンクから遷移してきた場合、フラグを消して左を向く顔(右から来た)にする
                LoaderUI.loader.classList.remove('slide-in-right', 'slide-out-left', 'slide-out-up', 'hidden');

                // 次のフレームで付与しないと、transitionが走って画面端から飛んでくるのが見えてしまうため一瞬切る
                LoaderUI.loader.style.transition = 'none';
                LoaderUI.loader.classList.add('slide-center');

                // 強制的に再描画させる
                void LoaderUI.loader.offsetWidth;
                LoaderUI.loader.style.transition = '';

                LoaderUI.setText('\\(^ _ ^ )');
                LoaderUI.setSubText('');
                sessionStorage.removeItem('navigatingInternal');
                this.minTimeElapsed = true; // 待ち時間なし
            } else if (this.isFirstVisit) {
                // 初回アクセス
                InitialAnimation.run(() => {
                    this.minTimeElapsed = true;
                    this.tryFinish();
                });
            } else {
                // 単純な再アクセス（2回目以降）
                LoaderUI.setText('( ^ _ ^ ) v'); // デフォルト顔
                LoaderUI.setSubText('');
                this.minTimeElapsed = true;
            }
        },

        watchLoad() {
            const bgVideo = document.querySelector('video[autoplay]');
            const markLoaded = () => {
                this.pageLoaded = true;
                this.tryFinish();
            };

            if (bgVideo && bgVideo.readyState < 3) {
                bgVideo.addEventListener('canplaythrough', markLoaded, { once: true });
                setTimeout(markLoaded, 8000); // 8秒フォールバック
            } else {
                window.addEventListener('load', markLoaded);
                setTimeout(markLoaded, 200); // 動画がない場合は即座にフラグを立てるが少し余裕を持たせる
            }

            setTimeout(markLoaded, 10000); // 10秒絶対フォールバック
        },

        tryFinish() {
            if (this.minTimeElapsed && this.pageLoaded && !this.finished) {
                this.finished = true;

                if (this.isFirstVisit && !this.isFromInternalLink) {
                    InitialAnimation.finish();
                } else if (this.isFromInternalLink) {
                    requestAnimationFrame(() => {
                        LoaderUI.setText('( ^ _ ^) /'); // ピースサインを見せてから
                        SlideTransition.onPageEnter();   // 左へ抜ける
                    });
                } else {
                    // 単純なリロードなどの場合
                    LoaderUI.setText('( ^ _ ^ ) v');
                    setTimeout(() => LoaderUI.slideOutToTop(), 100);
                }
            }
        }
    };

    // 起動
    LoaderCore.init();

})();