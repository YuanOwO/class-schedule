console.log("Hello!", new Date());

const CONF = {
        wds: 5,
        seg: [Infinity, -Infinity],
    },
    WEEKDAYS = "一二三四五六日",
    TIME = [
        "第零節\n06:20\n~\n08:10",
        "第一節\n08:20\n~\n09:10",
        "第二節\n09:20\n~\n10:10",
        "第三節\n10:20\n~\n11:10",
        "第四節\n11:15\n~\n12:05",
        "第五節\n12:10\n~\n13:00",
        "第六節\n13:10\n~\n14:00",
        "第七節\n14:10\n~\n15:00",
        "第八節\n15:10\n~\n16:00",
        "第九節\n16:05\n~\n16:55",
        "第十節\n17:30\n~\n18:20",
        "第十一節\n18:30\n~\n19:20",
        "第十二節\n19:25\n~\n20:15",
        "第十三節\n20:20\n~\n21:10",
        "第十四節\n21:15\n~\n22:05",
    ],
    BUILDINGS = {
        AAC: "水生動物實驗中心",
        ADM: "行政大樓",
        BOH: "人文大樓",
        CC3: "電算中心三樓",
        CC4: "電算中心四樓",
        "CE-": "工學院大樓",
        CLS: "生命科學院館",
        ECG: "電資暨綜合教學大樓",
        EE1: "電機一館",
        EE2: "電機二館",
        FRB: "第一餐廳",
        FSB: "食安所館",
        FSH: "環漁系館",
        GH1: "綜合一館",
        GH2: "綜合二館",
        GH3: "綜合三館",
        GRC: "綜合研究中心",
        GYM: "體育館",
        HR1: "河工一館",
        HR2: "河工二館",
        HRE: "海工館",
        INS: "資工系館",
        IVY: "沛華大樓",
        LIB: "圖書館",
        MAF: "海事大樓",
        MEA: "機械A館",
        MEB: "機械B館",
        MFE: "食科工程館",
        MFS: "食品科學館",
        "MZ-": "馬祖校區教學大樓",
        NAV: "商船大樓",
        NVA: "造船系館",
        OCE: "海洋系館",
        ODB: "海大意象館(海洋夢想基地)",
        SAC: "學生活動中心",
        SAH: "海空大樓",
        SPF: "體育場地",
        STA: "育樂館",
        STM: "航管大樓",
        TEC: "延平技術大樓",
        UAH: "空蝕水槽",
    };
// 樓館備註
// 體育場地包括：
//     籃球場、高爾夫練習場、排球場、
//     操場、網球場、游泳池、健身房
// 行政大樓包括：
//     ADM001 海洋廳
//     ADM002 第一演講廳
//     ADM003 第二演講廳

const SCHEDULE = (() => {
    let schedule = {};
    for (const code in classdata) {
        if (Object.hasOwnProperty.call(classdata, code)) {
            const cls = classdata[code];
            if (typeof cls.time === "string") cls.time = cls.time.split(",");
            if (typeof cls.place === "string") cls.place = cls.place.split(",");
            for (let i = 0; i < cls.time.length; i++) {
                const t = cls.time[i] % 100,
                    w = (cls.time[i] - t) / 100;
                if (t < CONF.seg[0]) CONF.seg[0] = t;
                if (t > CONF.seg[1]) CONF.seg[1] = t;
                if (w > CONF.wds) CONF.wds = w;
                schedule[cls.time[i]] = {
                    code: code,
                    name: cls.name,
                    teacher: cls.teacher,
                    place: cls.place[i],
                };
            }
        }
    }
    return schedule;
})();

const flash = () => {
    const thead = document.getElementsByTagName("thead")[0],
        tbody = document.getElementsByTagName("tbody")[0];
    let tr, th, td, div;

    thead.innerHTML = "";
    tbody.innerHTML = "";

    tr = thead.appendChild(document.createElement("tr"));
    tr.appendChild(document.createElement("td"));
    for (let i = 0; i < CONF.wds; i++) {
        th = tr.appendChild(document.createElement("th"));
        th.scope = "col";
        th.innerText = WEEKDAYS[i];
    }

    for (let i = CONF.seg[0]; i <= CONF.seg[1]; i++) {
        tr = tbody.appendChild(document.createElement("tr"));
        th = tr.appendChild(document.createElement("th"));
        th.scope = "row";
        th.innerText = TIME[i];
        for (let j = 0; j < CONF.wds; j++) {
            td = tr.appendChild(document.createElement("td"));
            const t = ((j + 1) * 100 + i).toString(),
                cls = SCHEDULE[t];
            if (cls === undefined) td.innerText = "";
            else {
                div = td.appendChild(document.createElement("div"));
                div.innerText = SCHEDULE[t].name
                    .replace("_", "\n")
                    .replace("【", "\n【")
                    .replace("）（", "）\n（");
                div.classList.add("fw-semibold");

                div.setAttribute("data-bs-toggle", "tooltip");
                div.setAttribute("data-bs-placement", "top");
                div.setAttribute(
                    "data-bs-title",
                    "教師：" + SCHEDULE[t].teacher
                );

                // div = td.appendChild(document.createElement("div"));
                // div.innerText = SCHEDULE[t].teacher;

                div = td.appendChild(document.createElement("div"));
                div.innerText = SCHEDULE[t].place;
                // div.classList.add("fw-light");
                div.setAttribute("data-bs-toggle", "tooltip");
                div.setAttribute("data-bs-placement", "bottom");
                div.setAttribute(
                    "data-bs-title",
                    BUILDINGS[SCHEDULE[t].place.slice(0, 3)]
                );
            }
        }
    }

    (() => {
        let tips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        Array.from(tips).map((elem) => new bootstrap.Tooltip(elem));
    })();
};

window.onload = () => {
    flash();
};
