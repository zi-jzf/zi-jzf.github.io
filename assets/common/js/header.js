(function () {
    // 1. 現在のパスの階層を判定してリンクを調整する
    const path = window.location.pathname;
    // 簡易チェック: パスに "/works/" が含まれていれば、1階層深いとみなす
    const isWorkPage = path.includes('/works/');

    // ルートパスの設定（詳細ページなら "../"、トップなら "./"）
    const rootPath = isWorkPage ? '../' : './';

    // リンクのスマートな制御
    // トップページにいる場合は、スムーズスクロールのために単純なアンカーリンク(#)を使用する
    // 詳細ページにいる場合は、トップページに戻るために index.html を付与する
    const worksHref = isWorkPage ? '../index.html#works' : '#works';
    const aboutHref = isWorkPage ? '../index.html#about' : '#about';
    const logoHref = isWorkPage ? '../index.html' : '#';

    // 2. ヘッダーのHTMLを構築
    const headerHTML = `
    <header>
        <a href="${logoHref}" class="logo">
            <span class="kao-ani"></span>
        </a>
        <nav>
            <div id="nav-indicator"></div>
            <a href="${worksHref}">Works</a>
            <a href="${aboutHref}">Info</a>
        </nav>
    </header>
    `;

    // 3. <body>の直前にヘッダーを挿入
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

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
