const CONFIG = {
        wds: 5,
        seg: [Infinity, -Infinity],
    },
    SCHEDULE_DATA = {},
    get_data = (semester) => {
        function reqListener() {
            SCHEDULE_DATA[semester] = JSON.parse(this.responseText);
            render();
        }

        let oReq = new XMLHttpRequest(),
            file = `/assets/semester_${semester}.json`;

        console.log("GET", file);

        oReq.addEventListener("load", reqListener);
        oReq.open("GET", file);
        oReq.send();
    },
    generate_schedule = (semester) => {
        let schedule = {},
            classdata = SCHEDULE_DATA[semester];

        if (classdata === undefined) return {};

        // console.log(semester);
        // console.log(classdata);

        for (const pkno in classdata) {
            if (Object.hasOwnProperty.call(classdata, pkno)) {
                const cls = classdata[pkno];
                // console.log(cls);
                for (let i = 0; i < cls.time.length; i++) {
                    const t = cls.time[i] % 100,
                        w = (cls.time[i] - t) / 100;
                    if (w > CONFIG.wds) CONFIG.wds = w;
                    schedule[cls.time[i]] = structuredClone(cls);
                    schedule[cls.time[i]]["time"] = cls["time"][i];
                    schedule[cls.time[i]]["classroom"] = cls["classroom"][i];
                }
            }
        }
        return schedule;
    },
    render = () => {
        // 初始化
        const semester = document.getElementById("semester").value,
            SCHEDULE = generate_schedule(semester),
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
                if (cls === undefined) td.innerText = "";
                else {
                    td.onclick = () => show_info(cls.pkno);
                    // td.setAttribute("data-bs-toggle", "modal");
                    // td.setAttribute("data-bs-target", "#infoModal");

                    // 課程名稱
                    div = td.appendChild(document.createElement("div"));
                    div.innerText = SCHEDULE[t]["name"]
                        .replace("_", "\n")
                        .replace("【", "\n【")
                        .replace("）（", "）\n（");
                    div.classList.add("fw-semibold");

                    // 教師名稱
                    div.setAttribute("data-bs-toggle", "tooltip");
                    div.setAttribute("data-bs-placement", "top");
                    div.setAttribute("data-bs-title", "教師：" + SCHEDULE[t]["lecturer"]);

                    // div = td.appendChild(document.createElement("div"));
                    // div.innerText = SCHEDULE[t]['lecturer'];

                    // 教室名稱
                    div = td.appendChild(document.createElement("div"));
                    div.innerText = SCHEDULE[t]["classroom"];
                    // div.classList.add("fw-light");
                    div.setAttribute("data-bs-toggle", "tooltip");
                    div.setAttribute("data-bs-placement", "bottom");
                    div.setAttribute("data-bs-title", BUILDINGS[SCHEDULE[t]["classroom"].slice(0, 3)]);
                }
            }
        }

        (() => {
            let tips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            Array.from(tips).map((elem) => new bootstrap.Tooltip(elem));
        })();
    },
    show_info = (code) => {
        const cls = SCHEDULE_DATA[document.getElementById("semester").value][code],
            modal = new bootstrap.Modal("#infoModal"),
            container = document.getElementById("modal-container"),
            info_fileds = [
                "code",
                "name",
                "department",
                "lecturer",
                "grade",
                "credit",
                "time",
                "classroom",
                "MUST",
                "COSTERM",
            ],
            outline_fileds = ["objective", "outline", "teaching_method", "syllabus", "evaluation"];

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
            else content.innerText = cls[key];
        }
    };

window.addEventListener("load", () => {
    console.log("Hello!", new Date());
    render();
    document.getElementById("semester").addEventListener("change", render);
});
