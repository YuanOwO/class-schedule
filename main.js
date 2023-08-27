console.log("Hello!");

const conf = {
        weekdays: "一二三四五",
        seg: [1, 9],
    },
    time = [
        "第零節\n(06:20~08:10)",
        "第一節\n(08:20~09:10)",
        "第二節\n(09:20~10:10)",
        "第三節\n(10:20~11:10)",
        "第四節\n(11:15~12:05)",
        "第五節\n(12:10~13:00)",
        "第六節\n(13:10~14:00)",
        "第七節\n(14:10~15:00)",
        "第八節\n(15:10~16:00)",
        "第九節\n(16:05~16:55)",
        "第十節\n(17:30~18:20)",
        "第十一節\n(18:30~19:20)",
        "第十二節\n(19:25~20:15)",
        "第十三節\n(20:20~21:10)",
        "第十四節\n(21:15~22:05)",
    ],
    schedule = (() => {
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
    let tr, th, td, span;

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
                span = td.appendChild(document.createElement("span"));
                span.innerText = schedule[t].name;
                td.appendChild(document.createElement("br"));
                span = td.appendChild(document.createElement("span"));
                span.classList.add("font-monospace");
                span.innerText = schedule[t].place;
            }
        }
    }
};
