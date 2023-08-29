console.log("Hello!", new Date());

const schedule = (() => {
    let schedule = {};
    for (const code in classdata) {
        if (Object.hasOwnProperty.call(classdata, code)) {
            const cls = classdata[code];
            for (let i = 0; i < cls.time.length; i++)
                schedule[cls.time[i]] = {
                    code: code,
                    name: cls.name,
                    teacher: cls.teacher,
                    place: cls.place[i],
                };
        }
    }
    return schedule;
})();

window.onload = () => {
    const table = document.getElementsByTagName("tbody")[0];
    let tr, th, td, div;

    tr = document
        .getElementsByTagName("thead")[0]
        .appendChild(document.createElement("tr"));
    tr.appendChild(document.createElement("td"));
    for (const wd of conf.weekdays) {
        th = tr.appendChild(document.createElement("th"));
        th.scope = "col";
        th.innerText = wd;
    }

    for (let i = conf.seg[0]; i < conf.seg[1]; i++) {
        tr = table.appendChild(document.createElement("tr"));
        th = tr.appendChild(document.createElement("th"));
        th.scope = "row";
        th.innerText = time[i];
        for (let j = 0; j < conf.weekdays.length; j++) {
            td = tr.appendChild(document.createElement("td"));
            const t = ((j + 1) * 100 + i).toString(),
                cls = schedule[t];
            if (cls === undefined) td.innerText = "";
            else {
                div = td.appendChild(document.createElement("div"));
                div.innerText = schedule[t].name
                    .replace("_", "\n")
                    .replace("）（", "）\n（");

                // div = td.appendChild(document.createElement("div"));
                // div.innerText = schedule[t].teacher;

                div = td.appendChild(document.createElement("div"));
                div.innerText = schedule[t].place;
                div.classList.add("fw-light");
                div.setAttribute("data-bs-toggle", "tooltip");
                div.setAttribute("data-bs-placement", "bottom");
                div.setAttribute(
                    "data-bs-title",
                    buildings[schedule[t].place.slice(0, 3)]
                );
            }
        }
    }

    (() => {
        let tips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        Array.from(tips).map((elem) => new bootstrap.Tooltip(elem));
    })();
};
