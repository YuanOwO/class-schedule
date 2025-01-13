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

        for (const code in classdata) {
            if (Object.hasOwnProperty.call(classdata, code)) {
                const cls = classdata[code];
                // console.log(cls);
                if (typeof cls.time === "string") cls.time = cls.time.split(",");
                if (typeof cls.place === "string") cls.place = cls.place.split(",");
                for (let i = 0; i < cls.time.length; i++) {
                    const t = cls.time[i] % 100,
                        w = (cls.time[i] - t) / 100;
                    if (w > CONFIG.wds) CONFIG.wds = w;
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
    },
    render = () => {
        const semester = document.getElementById("semester").value,
            SCHEDULE = generate_schedule(semester),
            thead = document.getElementsByTagName("thead")[0],
            tbody = document.getElementsByTagName("tbody")[0];
        let tr, th, td, div;

        thead.innerHTML = "";
        tbody.innerHTML = "";

        tr = thead.appendChild(document.createElement("tr"));
        tr.appendChild(document.createElement("td"));

        for (let i = 0; i < CONFIG.wds; i++) {
            th = tr.appendChild(document.createElement("th"));
            th.scope = "col";
            th.innerText = WEEKDAYS[i];
        }

        //////////////////////////////

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
                    div = td.appendChild(document.createElement("div"));
                    div.innerText = SCHEDULE[t].name.replace("_", "\n").replace("【", "\n【").replace("）（", "）\n（");
                    div.classList.add("fw-semibold");

                    div.setAttribute("data-bs-toggle", "tooltip");
                    div.setAttribute("data-bs-placement", "top");
                    div.setAttribute("data-bs-title", "教師：" + SCHEDULE[t].teacher);

                    // div = td.appendChild(document.createElement("div"));
                    // div.innerText = SCHEDULE[t].teacher;

                    div = td.appendChild(document.createElement("div"));
                    div.innerText = SCHEDULE[t].place;
                    // div.classList.add("fw-light");
                    div.setAttribute("data-bs-toggle", "tooltip");
                    div.setAttribute("data-bs-placement", "bottom");
                    div.setAttribute("data-bs-title", BUILDINGS[SCHEDULE[t].place.slice(0, 3)]);
                }
            }
        }

        (() => {
            let tips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            Array.from(tips).map((elem) => new bootstrap.Tooltip(elem));
        })();
    };

window.addEventListener("load", () => {
    console.log("Hello!", new Date());
    render();
    document.getElementById("semester").addEventListener("change", render);
});
