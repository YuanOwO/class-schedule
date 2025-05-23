const CONFIG = {
    wds: 5,
    seg: [Infinity, -Infinity],
};

const SCHEDULE_DATA = {};

/**
 * 取得該學期的課程資訊
 */
const get_data = (semester) => {
    const oReq = new XMLHttpRequest();
    let file = `/assets/semester_${semester}.json`;

    /**
     * 請求到資料後的處理事件
     */
    const reqListener = () => {
        if (oReq.status !== 200) {
            // 請求失敗
            console.error(`Failed to load ${file}!\nStatus Code: ${oReq.status}`);

            const tbody = document.getElementsByTagName("tbody")[0];
            tbody.innerHTML = ""; // 清空表格
            render_thead(); // 顯示星期表頭

            // 顯示 "Not Found :("
            let td = tbody.appendChild(document.createElement("tr")).appendChild(document.createElement("td"));
            td.colSpan = CONFIG.wds + 1;
            td.innerText = "Not Found :(";
            return;
        }

        SCHEDULE_DATA[semester] = oReq.response;
        render(semester); // 顯示課表
    };

    console.log("GET", file);
    oReq.addEventListener("load", reqListener);
    oReq.responseType = "json";
    oReq.open("GET", file);
    oReq.send();
};

/**
 * 將課程資訊轉換成課表
 */
const generate_schedule = (semester) => {
    let classdata = SCHEDULE_DATA[semester];

    if (classdata === undefined) return {}; // 沒有資料

    // console.log(semester);
    // console.log(classdata);

    let schedule = {}; // 課表

    CONFIG.wds = 5; // 重設每周的天數

    for (const pkno in classdata) {
        if (Object.hasOwnProperty.call(classdata, pkno)) {
            const cls = classdata[pkno];
            // console.log(cls);
            for (let i = 0; i < cls.time.length; i++) {
                // 處理該節次
                let t = cls.time[i] % 100,
                    w = (cls.time[i] - t) / 100;

                if (w > CONFIG.wds) CONFIG.wds = w;

                // 單一節次
                let cls2 = structuredClone(cls);
                cls2["time"] = cls["time"][i];
                cls2["classroom"] = cls["classroom"][i];

                // 如果該時間沒有課程，則初始化為空陣列
                if (schedule[cls.time[i]] === undefined) schedule[cls.time[i]] = [];

                schedule[cls.time[i]].push(cls2);
            }
        }
    }

    return schedule;
};

/**
 * 顯示課表的星期表頭
 */
const render_thead = () => {
    const thead = document.getElementsByTagName("thead")[0];
    thead.innerHTML = ""; // 清空表頭

    let tr = thead.appendChild(document.createElement("tr"));
    tr.appendChild(document.createElement("th"));

    for (let i = 0; i < CONFIG.wds; i++) {
        let th = tr.appendChild(document.createElement("th"));
        th.scope = "col";
        th.innerText = WEEKDAYS[i];
    }
};

/**
 * 顯示課表
 */
const render = (semester) => {
    // 初始化
    const SCHEDULE = generate_schedule(semester);
    const tbody = document.getElementsByTagName("tbody")[0];

    tbody.innerHTML = ""; // 清空表格
    render_thead(); // 顯示星期表頭

    //////////////////////////////

    // console.log(SCHEDULE);

    // 課表沒有資料 => 還在載入
    if (Object.keys(SCHEDULE).length === 0) {
        // 顯示 "Loading..."
        let td = tbody.appendChild(document.createElement("tr")).appendChild(document.createElement("td"));
        td.colSpan = CONFIG.wds + 1;
        td.innerText = "Loading...";

        // 抓取資料
        get_data(semester);
        return;
    }

    //////////////////////////////
    // 處理課表資料

    let segs = Object.keys(SCHEDULE).map((x) => parseInt(x) % 100),
        start = Math.min(CONFIG.seg[0], ...segs),
        end = Math.max(CONFIG.seg[1], ...segs);

    for (let i = start; i <= end; i++) {
        let tr = tbody.appendChild(document.createElement("tr"));

        // 該節次的時間
        let th = tr.appendChild(document.createElement("th"));
        th.scope = "row";
        th.innerText = TIME[i];

        for (let j = 0; j < CONFIG.wds; j++) {
            let td = tr.appendChild(document.createElement("td"));

            const time = ((j + 1) * 100 + i).toString();

            if (SCHEDULE[time] === undefined) continue; // 該節為空堂

            // 顯示該時間的課程
            for (let k = 0; k < SCHEDULE[time].length; k++) {
                const cls = SCHEDULE[time][k];
                let course;

                if (SCHEDULE[time].length > 1) {
                    course = td.appendChild(document.createElement("div"));
                } else {
                    course = td;
                }
                course.classList.add("course");
                course.onclick = () => show_info(semester, cls.pkno);
                // course.setAttribute("data-bs-toggle", "modal");
                // course.setAttribute("data-bs-target", "#infoModal");

                let div;

                // 課程名稱
                div = course.appendChild(document.createElement("div"));
                div.innerText = cls["name"].replace("_", "\n").replace("【", "\n【").replace("）（", "）\n（");
                div.classList.add("fw-semibold");

                // 體育課加上班級名稱
                if (cls.department === "體育室") {
                    div.innerText += " " + cls.grade[1];
                }

                // 教師名稱
                div.setAttribute("data-bs-toggle", "tooltip");
                div.setAttribute("data-bs-placement", "top");
                div.setAttribute("data-bs-title", "教師：" + cls["lecturer"]);

                // 教室名稱
                let building, // 樓館名稱
                    classroom = cls.classroom; // 教室代碼

                if (classroom === "ONL") {
                    building = "線上課程";
                } else if (classroom === "SPF006") {
                    building = "游泳池";
                } else if (classroom.startsWith("ADM")) {
                    building = "行政大樓";
                    if (BUILDINGS[classroom]) building += " " + BUILDINGS[classroom];
                } else {
                    building = BUILDINGS[classroom.slice(0, 3)];
                }

                div = course.appendChild(document.createElement("div"));
                div.innerText = cls.classroom;
                // div.classList.add("fw-light");
                div.setAttribute("data-bs-toggle", "tooltip");
                div.setAttribute("data-bs-placement", "bottom");
                div.setAttribute("data-bs-title", building);
            }
        }
    }

    // 加入提示框
    (() => {
        let tips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        Array.from(tips).map((elem) => new bootstrap.Tooltip(elem));
    })();
};

const show_info = (semester, code) => {
    const cls = SCHEDULE_DATA[semester][code]; // 課程資料
    const cvt = new showdown.Converter(); // markdown 轉換器

    const container = document.getElementById("modal-container");
    container.innerHTML = "";

    for (const key of MODEL_FILEDS) {
        let col = container.appendChild(document.createElement("div"));
        col.classList.add("col-12", "d-flex");
        if (!OUTLINE_FILEDS.includes(key)) col.classList.add("col-md-6");

        // 欄位名稱
        let title = col.appendChild(document.createElement("div"));
        title.classList.add("p-2", "flex-shrink-0", "border-bottom", "fw-bold");
        title.innerText = MODAL_TITLE[key];

        // 欄位內容
        let content = col.appendChild(document.createElement("div"));
        content.classList.add("p-2", "flex-grow-1", "border-bottom");

        if (key === "code") {
            content.appendChild(document.createElement("code")).innerText = cls[key];
        } else if (key === "time" || key === "classroom") {
            content.innerText = cls[key].join(", ");
        } else if (OUTLINE_FILEDS.includes(key)) {
            content.innerHTML = cvt.makeHtml(cls[key]);
        } else {
            content.innerText = cls[key];
        }
    }

    new bootstrap.Modal("#infoModal").show(); // 顯示 modal
};

(() => {
    console.log("Hello!", new Date());
    showdown.setOption("simpleLineBreaks", true); // 直接換行

    const select = document.getElementById("semester"); // 學期選單
    let semester; // 要顯示的學期

    if (location.hash) {
        // 優先從 hash 決定學期
        semester = location.hash.slice(1); // 去掉 #
    } else {
        // 最後使用選單的值
        // 如果沒有選擇學期，則選擇最後一個
        if (select.value === "") select.value = select.options[select.options.length - 1].value;
        semester = select.value;
    }

    render(semester); // 顯示課表

    window.addEventListener("hashchange", () => {
        // 當 hash 改變時，更新課表
        render(location.hash.slice(1));
    });

    select.addEventListener("change", () => {
        // 當選擇學期時，更新課表
        render(select.value);
    });
})();
