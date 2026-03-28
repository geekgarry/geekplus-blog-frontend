const today = new Date();
const month = today.getMonth() + 1; // 月份从0开始
const day = today.getDate();

// 判断是否为春节（2026年春节为1月29日）
if (month === 1 && day >= 12 && day <= 31) {
    //loadStyle('https://your-cdn.com/spring-festival.css');
}

// 判断是否为中秋节（2026年中秋节为10月1日）
if (month === 10 && day >= 1 && day <= 15) {
    //loadStyle('https://your-cdn.com/mid-autumn.css');
}

function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
}

function loadStyle(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}
