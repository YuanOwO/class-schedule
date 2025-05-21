const CONFIG = {
        wds: 5,
        seg: [Infinity, -Infinity],
    },
    SCHEDULE_DATA = {},
    get_data = (semester) => {
        /**
         * 取得該學期的課程資訊
         */
        function reqListener() {
            // 請求到資料後
            if (this.status !== 200) {
                console.error(`Failed to load ${file}!\nStatus Code: ${this.status}`);

                // render(semester);

                // 清空表格
                const tbody = document.getElementsByTagName("tbody")[0];
                tbody.innerHTML = "";

                let tr = tbody.appendChild(document.createElement("tr")),
                    td = tr.appendChild(document.createElement("td"));

                td.colSpan = CONFIG.wds + 1;
                td.innerText = "Not Found :(";
                tr.appendChild(td);
                tbody.appendChild(tr);
                return;
            }

            SCHEDULE_DATA[semester] = JSON.parse(this.responseText);
            render(semester);
        }

        let oReq = new XMLHttpRequest(),
            file = `/assets/semester_${semester}.json`;

        console.log("GET", file);

        oReq.addEventListener("load", reqListener);
        oReq.open("GET", file);
        oReq.send();
    },
    generate_schedule = (semester) => {
        /**
         * 將課程資訊轉換成課表
         */

        let schedule = {},
            classdata = SCHEDULE_DATA[semester];

        if (classdata === undefined) return {};

        // console.log(semester);
        // console.log(classdata);

        // 重設每周的天數
        CONFIG.wds = 5;

        for (const pkno in classdata) {
            if (Object.hasOwnProperty.call(classdata, pkno)) {
                const cls = classdata[pkno];
                // console.log(cls);
                for (let i = 0; i < cls.time.length; i++) {
                    // 處理該節次
                    const t = cls.time[i] % 100,
                        w = (cls.time[i] - t) / 100;

                    if (w > CONFIG.wds) CONFIG.wds = w;

                    let clscpy = structuredClone(cls);

                    clscpy["time"] = cls["time"][i];
                    clscpy["classroom"] = cls["classroom"][i];

                    if (schedule[cls.time[i]] === undefined) schedule[cls.time[i]] = [];
                    schedule[cls.time[i]].push(clscpy);
                }
            }
        }
        return schedule;
    },
    render = (semester) => {
        /**
         * 顯示課表
         */
        // 初始化
        const SCHEDULE = generate_schedule(semester),
            thead = document.getElementsByTagName("thead")[0],
            tbody = document.getElementsByTagName("tbody")[0];
        let tr, th, td, div;

        thead.innerHTML = "";
        tbody.innerHTML = "";

        //////////////////////////////
        // 星期

        tr = thead.appendChild(document.createElement("tr"));
        tr.appendChild(document.createElement("td"));

        for (let i = 0; i < CONFIG.wds; i++) {
            th = tr.appendChild(document.createElement("th"));
            th.scope = "col";
            th.innerText = WEEKDAYS[i];
        }

        //////////////////////////////

        // 課表沒有資料 => 還在載入

        // console.log(SCHEDULE);

        if (Object.keys(SCHEDULE).length === 0) {
            get_data(semester);
            tr = tbody.appendChild(document.createElement("tr"));
            td = tr.appendChild(document.createElement("td"));
            td.colSpan = CONFIG.wds + 1;
            td.innerText = "Loading...";
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        //////////////////////////////

        // 處理課表資料

        let segs = Object.keys(SCHEDULE).map((x) => parseInt(x) % 100),
            start = Math.min(CONFIG.seg[0], ...segs),
            end = Math.max(CONFIG.seg[1], ...segs);

        for (let i = start; i <= end; i++) {
            tr = tbody.appendChild(document.createElement("tr"));
            th = tr.appendChild(document.createElement("th"));
            th.scope = "row";
            th.innerText = TIME[i];
            for (let j = 0; j < CONFIG.wds; j++) {
                td = tr.appendChild(document.createElement("td"));
                const t = ((j + 1) * 100 + i).toString(),
                    cls = SCHEDULE[t];
                if (cls === undefined) {
                    // 空堂
                    td.innerText = "";
                } else {
                    // 顯示該時間的課程
                    for (let k = 0; k < cls.length; k++) {
                        let clsdiv = document.createElement("div"),
                            course = cls[k];

                        if (k > 0) td.appendChild(document.createElement("hr")); // 分隔線

                        td.appendChild(clsdiv);
                        clsdiv.classList.add("course");
                        clsdiv.onclick = () => show_info(semester, course.pkno);

                        // clsdiv.setAttribute("data-bs-toggle", "modal");
                        // clsdiv.setAttribute("data-bs-target", "#infoModal");

                        // 課程名稱
                        div = clsdiv.appendChild(document.createElement("div"));
                        div.innerText = course["name"]
                            .replace("_", "\n")
                            .replace("【", "\n【")
                            .replace("）（", "）\n（");
                        div.classList.add("fw-semibold");

                        // 教師名稱
                        div.setAttribute("data-bs-toggle", "tooltip");
                        div.setAttribute("data-bs-placement", "top");
                        div.setAttribute("data-bs-title", "教師：" + course["lecturer"]);

                        // div = clsdiv.appendChild(document.createElement("div"));
                        // div.innerText = course['lecturer'];

                        // 教室名稱
                        div = clsdiv.appendChild(document.createElement("div"));
                        div.innerText = course["classroom"];
                        // div.classList.add("fw-light");
                        div.setAttribute("data-bs-toggle", "tooltip");
                        div.setAttribute("data-bs-placement", "bottom");
                        div.setAttribute("data-bs-title", BUILDINGS[course["classroom"].slice(0, 3)]);
                    }
                }
            }
        }

        (() => {
            let tips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            Array.from(tips).map((elem) => new bootstrap.Tooltip(elem));
        })();
    },
    info_fileds = ["code", "name", "department", "lecturer", "grade", "credit", "time", "classroom", "MUST", "COSTERM"],
    outline_fileds = ["objective", "outline", "teaching_method", "syllabus", "evaluation"],
    show_info = (semester, code) => {
        console.log("show_info", semester, code);
        const cls = SCHEDULE_DATA[semester][code],
            modal = new bootstrap.Modal("#infoModal"),
            container = document.getElementById("modal-container");

        modal.show();
        container.innerHTML = "";

        for (const key of info_fileds.concat(outline_fileds)) {
            let col = container.appendChild(document.createElement("div")),
                title = col.appendChild(document.createElement("div")),
                content = col.appendChild(document.createElement("div"));

            col.classList.add("col-12", "d-flex");
            if (info_fileds.includes(key)) col.classList.add("col-md-6");

            title.classList.add("p-2", "flex-shrink-0", "border-bottom", "fw-bold");
            title.innerText = MODAL_TITLE[key];

            content.classList.add("p-2", "flex-grow-1", "border-bottom");
            if (key === "code") content.appendChild(document.createElement("code")).innerText = cls[key];
            else if (key === "time" || key === "classroom") content.innerText = cls[key].join(", ");
            else content.innerText = cls[key];
        }
    };

window.addEventListener("load", () => {
    console.log("Hello!", new Date());

    const params = new URLSearchParams(location.search);

    let semester = params.has("semester") ? params.get("semester") : document.getElementById("semester").value;
    render(semester);

    document.getElementById("semester").addEventListener("change", function () {
        render(this.value);
    });
});
