let lastScrollTop = 0;

function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    var currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementBottom = reveals[i].getBoundingClientRect().bottom;
        var elementVisible = 100; // 発火するタイミング

        // 要素が画面内に入ったら発火
        if (elementTop < windowHeight - elementVisible && elementBottom > 0) {
            reveals[i].classList.add("active");
        } else {
            // 「reveal-repeat」クラスがついている要素の場合、
            // 上から下への通常スクロールで再出現させるために、
            // 「画面の下端から見えなくなった（上へスクロールして戻った）」場合にのみリセットする。
            // 画面の上端へ通り過ぎた場合はリセットしない（表示したまま）。
            if (reveals[i].classList.contains("reveal-repeat")) {
                if (elementTop >= windowHeight) {
                    // 要素が画面の下へ完全に消えた（＝上方向へスクロールして戻った）場合 -> 次の下スクロールのためにリセット
                    reveals[i].classList.remove("active");
                }
            }
        }
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // モバイルでのバウンススクロールに対応
}

window.addEventListener("scroll", reveal);

// 初回読み込み時にもチェック
window.addEventListener("load", reveal);
