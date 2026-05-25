(function () {
    // 1. 現在のパスの階層を判定してリンクを調整する
    const path = window.location.pathname;
    // パスに"/works/"が含まれていれば作品詳細ページ
    const isWorkPage = path.includes('/works/');
    // パスが"/about.html"または"/about"で終わればAboutページ
    const isAboutPage = path.endsWith('/about.html') || path.endsWith('/about');
    // 上記どちらでもなければトップページ（index.html）とみなす
    const isTopPage = !isWorkPage && !isAboutPage;

    // ルートパスの設定（works/配下なら "../"、ルート直下なら "./"）
    const rootPath = isWorkPage ? '../' : './';

    // リンクのスマートな制御
    // トップページのみ、スムーズスクロールのために単純なアンカーリンク(#)を使用する
    // Aboutページ・作品ページはトップに戻るために index.html を付与する
    const worksHref = isTopPage ? '#works' : (isWorkPage ? '../index.html#works' : './index.html#works');
    const aboutHref = isWorkPage ? '../about.html' : './about.html';
    // ロゴ: 全ページ共通でルート（"/"）へ戻る（index.htmlをURLに露出させない）
    // GitHub Pages では "/" がルートの index.html に解決される
    const logoHref = '/';

    // 2. ヘッダーのHTMLを構築
    const headerHTML = `
    <header>
        <a href="${logoHref}" class="logo">
            <span class="kao-ani"></span>
        </a>
        <nav>
            <div id="nav-indicator"></div>
            <a href="${worksHref}">Works</a>
            <a href="${aboutHref}">About</a>
        </nav>
    </header>
    `;

    // 3. スクリプトタグの直前にヘッダーを挿入 (DOMの順序を維持してmix-blend-modeのSafari等でのバグを防ぐため)
    const scriptTag = document.currentScript;
    if (scriptTag) {
        scriptTag.insertAdjacentHTML('beforebegin', headerHTML);
    } else {
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    // 4. 「ピンクのインジケーター」アニメーションの初期化
    const nav = document.querySelector('nav');
    const indicator = document.getElementById('nav-indicator');
    const navLinks = document.querySelectorAll('nav a');

    // 初期状態（隠しておく）
    if (indicator) indicator.style.opacity = '0';

    // ホバー時の動き
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', (e) => {
            const target = e.target;
            // ピンクの板をターゲットのサイズと位置に合わせる
            indicator.style.width = `${target.offsetWidth}px`;
            indicator.style.left = `${target.offsetLeft}px`;
            indicator.style.opacity = '1';
        });
    });

    // ナビゲーション全体からマウスが外れたら消す
    nav.addEventListener('mouseleave', () => {
        if (indicator) indicator.style.opacity = '0';
    });

})();
