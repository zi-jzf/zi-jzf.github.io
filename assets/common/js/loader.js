// loader.js
(function () {
    const style = document.createElement('style');
    style.textContent = `
        #global-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--bg-color, #cce0ee);
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: opacity 0.5s ease-out, visibility 0.5s ease-out;
            color: var(--text-color, #071641);
            font-family: var(--font-en, 'Bricolage Grotesque', sans-serif);
            font-size: 2.5rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            pointer-events: none;
        }
        #global-loader.hidden {
            opacity: 0;
            visibility: hidden;
        }
        .loader-text {
            display: inline-block;
            min-width: 15ch; /* ★文字数が変わった時の左右のブレ（ガタツキ）を防ぐ */
            text-align: center;
            white-space: nowrap;
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            margin-bottom: 10px; /* 下の文字との余白を小さくする */
            font-family: var(--font-en, 'Bricolage Grotesque', sans-serif); /* デフォルトは元のフォント */
        }
        /* iOS/iPadOS Safari など Apple製デバイスの場合のみ、アンダーバーの描画ブレを防ぐためにシステムフォントを適用 */
        @supports (-webkit-touch-callout: none) {
            .loader-text {
                font-family: system-ui, -apple-system, sans-serif;
            }
        }
        .loader-subtext {
            font-size: 1.1rem;
            font-weight: 500; /* 細めに設定 */
            letter-spacing: 0.2em;
            color: rgba(7, 22, 65, 0.6); /* メインカラーより少し薄く */
            text-transform: lowercase;
            text-align: center;
        }
        .loading-dots {
            display: inline-block;
            width: 3ch; /* ドット3つ分を固定幅で確保 */
            text-align: left; /* 左揃えでドットが増えても左側の文字が動かないようにする */
        }
        #loader-container {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
    `;
    document.head.appendChild(style);

    const loader = document.createElement('div');
    loader.id = 'global-loader';

    const container = document.createElement('div');
    container.id = 'loader-container';

    const textElement = document.createElement('div');
    textElement.className = 'loader-text';
    textElement.textContent = '( x _ x )';

    const subTextElement = document.createElement('div');
    subTextElement.className = 'loader-subtext';
    subTextElement.innerHTML = 'loading<span class="loading-dots">.</span>';

    container.appendChild(textElement);
    container.appendChild(subTextElement);
    loader.appendChild(container);

    const initLoader = () => {
        if (!document.getElementById('global-loader')) {
            document.body.prepend(loader);
        }
    };

    if (document.body) {
        initLoader();
    } else {
        document.addEventListener('DOMContentLoaded', initLoader);
    }

    let minTimeElapsed = false;
    let pageLoaded = false;
    let finished = false;

    // ★セッションストレージを使って初回訪問かどうかを判定
    const isFirstVisit = !sessionStorage.getItem('hasSeenLoader');

    if (isFirstVisit) {
        // 初回訪問時のみ、こだわりのアニメーションを実行
        setTimeout(() => { if (textElement) textElement.textContent = '( ^ _ ^ )'; }, 200);   // 普通の顔（400ms間表示）
        setTimeout(() => { if (textElement) textElement.textContent = '☆-( - _ ^ )'; }, 600);   // 左ウインク（400ms間表示）
        setTimeout(() => { if (textElement) textElement.textContent = '( ^ _ ^ )'; }, 1000);  // 普通の顔に戻る（400ms間表示）
        setTimeout(() => { if (textElement) textElement.textContent = '( ^ _ - )-☆'; }, 1400);  // 右ウインク（★600ms間表示：長め）
        setTimeout(() => {
            if (textElement) textElement.textContent = '( - _ - )'; // 待機中の寝顔
            minTimeElapsed = true;
            checkFinish();
        }, 2000); // 2000ms時点で最低表示時間クリア＆寝顔へ移行
    } else {
        // 2回目以降はアニメーションの待ち時間をなくし、すぐにロード完了状態にする
        textElement.textContent = '( ^ _ ^ ) v';
        subTextElement.textContent = 'completed!';
        minTimeElapsed = true;
    }

    // 「loading...」のドットを 1,2,3,1,2,3... でループさせるアニメーション
    let dotCount = 1;
    let isBlinking = true;

    const blinkInterval = setInterval(() => {
        if (!isBlinking) return;

        dotCount = (dotCount % 3) + 1; // 1 -> 2 -> 3 -> 1 ...

        const dotsSpan = subTextElement.querySelector('.loading-dots');
        if (dotsSpan) {
            dotsSpan.textContent = '.'.repeat(dotCount);
        }
    }, 400);

    const checkVideoAndFinish = () => {
        // 背景動画があれば、それが再生可能になるまで待つ
        const bgVideo = document.querySelector('video[autoplay]');

        if (bgVideo && bgVideo.readyState < 3) {
            // 動画の読み込みがまだ不十分な場合
            bgVideo.addEventListener('canplaythrough', () => {
                pageLoaded = true;
                checkFinish();
            }, { once: true });

            // ネットワーク環境等でいつまでも動画が読み込めない場合のフォールバック（8秒）
            setTimeout(() => {
                pageLoaded = true;
                checkFinish();
            }, 8000);
        } else {
            // 動画がない、または既に十分読み込まれている場合
            pageLoaded = true;
            checkFinish();
        }
    };

    window.addEventListener('load', () => {
        checkVideoAndFinish();
    });

    // 何らかの理由で load が全く発火しなかった場合の大元のフォールバック（10秒）
    setTimeout(() => {
        pageLoaded = true;
        checkFinish();
    }, 10000);

    function checkFinish() {
        if (minTimeElapsed && pageLoaded && !finished) {
            finished = true;
            isBlinking = false; // ドットアニメーション停止

            if (isFirstVisit) {
                // 初回のみ：「覚醒」と「ピース」を見せる
                sessionStorage.setItem('hasSeenLoader', 'true'); // 初回再生済みとして記憶

                if (textElement) {
                    textElement.textContent = '( ^ _ ^ )!';
                    textElement.style.transform = 'scale(1.2)';
                    subTextElement.textContent = 'completed!'; // ロード完了の合図
                }

                setTimeout(() => {
                    if (textElement) {
                        textElement.textContent = '( ^ _ ^ ) v';
                        textElement.style.transform = 'scale(1)';
                    }

                    setTimeout(() => {
                        if (loader) loader.classList.add('hidden');
                        clearInterval(blinkInterval);
                    }, 400);
                }, 300);
            } else {
                // 2回目以降：待たせずに、ピースサインから一瞬でフェードアウト
                subTextElement.textContent = 'completed!';
                setTimeout(() => {
                    if (loader) loader.classList.add('hidden');
                    clearInterval(blinkInterval);
                }, 100); // 100msだけ（体感では一瞬）見せてすぐ消す
            }
        }
    }
})();
