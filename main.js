const CONFIG = {
    wds: 5,
    seg: [Infinity, -Infinity],
};

const DEFAULT_SEMESTER = "1151"; // 預設學期
const SCHEDULE_DATA = {};
const infoModal = new bootstrap.Modal("#infoModal"); // 課程資訊 Modal

/**
 * 取得該學期的課程資訊
 */
const get_data = () => {
    const semester = window.semester; // 學期
    const file = `/assets/semester_${semester}.json`;

    fetch(file)
        .then((response) => {
            if (!response.ok) throw new Error("Not Found :("); // 觸發 catch
            return response.json();
        })
        .then((data) => {
            SCHEDULE_DATA[semester] = data;
            render(); // 顯示課表
        })
        .catch((error) => {
            console.error("Fetch error:", error);
            render_error("Not Found :(");
        });
};

/**
 * 將課程資訊轉換成課表
 */
const generate_schedule = () => {
    let classdata = SCHEDULE_DATA[window.semester];

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
 * 顯示課表的表頭
 */
const render_thead = () => {
    const thead = document.getElementsByTagName("thead")[0];
    thead.innerHTML = ""; // 清空表頭

    let tr = thead.appendChild(document.createElement("tr")),
        th = tr.appendChild(document.createElement("th")),
        texts;

    if (window.VIEW === 1) {
        // 課表
        texts = Array.from(WEEKDAYS.slice(0, CONFIG.wds));
    } else {
        // 清單
        texts = ["課程代碼", "課程名稱", "教師", "班級", "上課時間", "上課地點"];
        th.textContent = "#";
        th.remove();
    }

    for (let i = 0; i < texts.length; i++) {
        th = tr.appendChild(document.createElement("th"));
        th.scope = "col";
        th.textContent = texts[i];
    }
};

/**
 * 顯示課表的錯誤訊息
 */
const render_error = (msg) => {
    const tbody = document.getElementsByTagName("tbody")[0];
    tbody.innerHTML = ""; // 清空表格

    render_thead(); // 顯示表頭
    let td = tbody.appendChild(document.createElement("tr")).appendChild(document.createElement("td"));
    td.colSpan = window.VIEW === 1 ? CONFIG.wds + 1 : 6;
    td.textContent = msg;
};

/**
 * 顯示課表
 */
const render = () => {
    const semester = window.semester; // 學期

    if (SCHEDULE_DATA[semester] === undefined) {
        // 課表沒有資料 => 還在載入
        render_error("Loading..."); // 顯示 "Loading..."
        get_data(); // 抓取資料
        return;
    }

    //////////////////////////////

    // 更新選單的值
    const select = document.getElementById("semester");
    if (document.querySelector(`option[value="${semester}"]`) === null) {
        // 選單中沒有該學期
        console.log(`Semester "${semester}" not found in the select options!`);
        let opt = select.appendChild(document.createElement("option"));
        opt.value = semester;
        opt.textContent = semester;
    }
    select.value = semester;

    const SCHEDULE = window.VIEW === 1 ? generate_schedule(semester) : SCHEDULE_DATA[semester];

    // 初始化表格
    const tbody = document.getElementsByTagName("tbody")[0];
    tbody.innerHTML = ""; // 清空表格
    render_thead(); // 顯示表頭

    if (window.VIEW === 1) {
        // 顯示課表
        let segs = Object.keys(SCHEDULE).map((x) => parseInt(x) % 100),
            start = Math.min(CONFIG.seg[0], ...segs),
            end = Math.max(CONFIG.seg[1], ...segs);

        for (let i = start; i <= end; i++) {
            let tr = tbody.appendChild(document.createElement("tr"));

            // 該節次的時間
            let th = tr.appendChild(document.createElement("th"));
            th.scope = "row";
            th.innerText = TIME[i]; // 需要換行

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
                    course.onclick = () => show_info(cls.pkno);
                    // course.setAttribute("data-bs-toggle", "modal");
                    // course.setAttribute("data-bs-target", "#infoModal");

                    let div;

                    // 課程名稱
                    div = course.appendChild(document.createElement("div"));
                    div.textContent = cls["name"].replace("_", "\n").replace("【", "\n【").replace("）（", "）\n（");
                    div.classList.add("fw-semibold");

                    // 體育課加上班級名稱
                    if (cls.department === "體育室") {
                        div.textContent += " " + cls.grade[1];
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
                    div.textContent = cls.classroom;
                    // div.classList.add("fw-light");
                    div.setAttribute("data-bs-toggle", "tooltip");
                    div.setAttribute("data-bs-placement", "bottom");
                    div.setAttribute("data-bs-title", building);
                }
            }
        }
    } else {
        // 顯示清單
        const pknos = Object.keys(SCHEDULE).sort((a, b) => {
            // 依照上課時間排序
            let sa = SCHEDULE[a],
                sb = SCHEDULE[b];

            let time = sa.time.join(", ").localeCompare(sb.time.join(", ")), // 比較上課時間
                code = sa.code.localeCompare(sb.code); // 比較課程代碼

            return time || code;
        });

        for (const pkno of pknos) {
            if (Object.hasOwnProperty.call(SCHEDULE, pkno)) {
                const cls = SCHEDULE[pkno];

                let tr = tbody.appendChild(document.createElement("tr"));
                tr.onclick = () => show_info(cls.pkno);

                for (const key of ["code", "name", "lecturer", "grade", "time", "classroom"]) {
                    let td = tr.appendChild(document.createElement(key === "code" ? "th" : "td"));

                    if (key === "code") td.scope = "row";

                    if (key === "time" || key === "classroom") {
                        td.textContent = cls[key].join(", ");
                    } else {
                        td.textContent = cls[key];
                    }
                }
            }
        }
    }

    // 加入提示框
    (() => {
        let tips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        Array.from(tips).map((elem) => new bootstrap.Tooltip(elem));
    })();
};

/**
 * 切換學期
 */
const switch_to = (semester = undefined) => {
    // 如果沒有指定學期，則使用預設學期
    // 1. 網址的 hash 部分
    // 2. localStorage
    // 3. 選單的值
    // 4. 預設值
    if (!semester)
        semester =
            location.hash.slice(1) ||
            localStorage.getItem("semester") ||
            document.getElementById("semester").value ||
            DEFAULT_SEMESTER;

    // 更新學期資料
    // console.log("Switching to semester:", semester); // 顯示切換學期的訊息
    window.semester = semester; // 更新學期
    localStorage.setItem("semester", semester); // 儲存到 localStorage

    render(); // 顯示課表
};

const show_info = (code) => {
    const cls = SCHEDULE_DATA[window.semester][code]; // 課程資料
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
        title.textContent = MODAL_TITLE[key];

        // 欄位內容
        let content = col.appendChild(document.createElement("div"));
        content.classList.add("p-2", "flex-grow-1", "border-bottom");

        if (key === "code") {
            content.appendChild(document.createElement("code")).textContent = cls[key];
        } else if (key === "time" || key === "classroom") {
            content.textContent = cls[key].join(", ");
        } else if (OUTLINE_FILEDS.includes(key)) {
            content.innerHTML = cvt.makeHtml(cls[key]);
        } else {
            content.textContent = cls[key];
        }
    }

    infoModal.show(); // 顯示 modal
};

(() => {
    console.log("Hello!", new Date());
    showdown.setOption("simpleLineBreaks", true); // MD 直接換行

    window.VIEW = 1; // 1: 課表，2: 清單

    switch_to(); // 切換到預設的學期

    for (const btn of document.getElementsByName("viewmode")) {
        // 切換顯示課表或清單
        btn.addEventListener("click", () => {
            window.VIEW = parseInt(btn.value);
            render(); // 重新渲染課表
        });
    }

    // 網址 hash 更新
    window.addEventListener("hashchange", () => {
        switch_to(location.hash.slice(1));
    });

    // 學期選單改變
    document.getElementById("semester").addEventListener("change", function () {
        switch_to(this.value);
    });
})();
