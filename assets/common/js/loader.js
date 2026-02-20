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
        }
    `;
    document.head.appendChild(style);

    const loader = document.createElement('div');
    loader.id = 'global-loader';

    const textElement = document.createElement('div');
    textElement.className = 'loader-text';
    textElement.textContent = '( x _ x )';

    loader.appendChild(textElement);

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
        setTimeout(() => { if (textElement) textElement.textContent = '( ^ _ ^ )'; }, 200);
        setTimeout(() => { if (textElement) textElement.textContent = '☆-( - _ ^ )'; }, 500);
        setTimeout(() => { if (textElement) textElement.textContent = '( ^ _ ^ )'; }, 750);
        setTimeout(() => { if (textElement) textElement.textContent = '( ^ _ - )-☆'; }, 950);
        setTimeout(() => {
            if (textElement) textElement.textContent = '( - _ - )';
            minTimeElapsed = true;
            checkFinish();
        }, 1100);
    } else {
        // 2回目以降はアニメーションの待ち時間をなくし、すぐにロード完了状態にする
        textElement.textContent = '( ^ _ ^ ) v';
        minTimeElapsed = true;
    }

    window.addEventListener('load', () => {
        pageLoaded = true;
        checkFinish();
    });

    // 何らかの理由でloadが発火しなかった場合のフォールバック（3秒）
    setTimeout(() => {
        pageLoaded = true;
        checkFinish();
    }, 3000);

    function checkFinish() {
        if (minTimeElapsed && pageLoaded && !finished) {
            finished = true;

            if (isFirstVisit) {
                // 初回のみ：「覚醒」と「ピース」を見せる
                sessionStorage.setItem('hasSeenLoader', 'true'); // 初回再生済みとして記憶

                if (textElement) {
                    textElement.textContent = '( ^ _ ^ )!';
                    textElement.style.transform = 'scale(1.2)';
                }

                setTimeout(() => {
                    if (textElement) {
                        textElement.textContent = '( ^ _ ^ ) v';
                        textElement.style.transform = 'scale(1)';
                    }

                    setTimeout(() => {
                        if (loader) loader.classList.add('hidden');
                    }, 400);
                }, 300);
            } else {
                // 2回目以降：待たせずに、ピースサインから一瞬でフェードアウト
                setTimeout(() => {
                    if (loader) loader.classList.add('hidden');
                }, 100); // 100msだけ（体感では一瞬）見せてすぐ消す
            }
        }
    }
})();
