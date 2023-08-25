import { gen_schedule, table_size, time } from "./data.js";

const schedule = gen_schedule();

window.onload = () => {
    let tr, th, td;
    const table = document.getElementsByTagName("tbody")[0];

    tr = document.createElement("tr");
    tr.appendChild(document.createElement("th"));
    for (let i = 0; i < table_size[0]; i++) {
        th = document.createElement("th");
        tr.appendChild(th);
        th.scope = "col";
        th.innerText = "一二三四五六日"[i];
    }
    document.getElementsByTagName("thead")[0].appendChild(tr);

    for (let i = 0; i < table_size[1]; i++) {
        tr = document.createElement("tr");
        th = document.createElement("th");
        table.appendChild(tr);
        tr.appendChild(th);
        th.scope = "row";
        th.innerText = time[i];
        for (let j = 0; j < table_size[0]; j++) {
            td = document.createElement("td");
            tr.appendChild(td);
            const time = ((j + 1) * 100 + i).toString(),
                cls = schedule[time];
            if (cls === undefined) td.innerText = "";
            else {
                let span = document.createElement("span");
                span.innerText = schedule[time].name;
                td.appendChild(span);
                td.appendChild(document.createElement("br"));

                span = document.createElement("span");
                span.classList.add("font-monospace");
                span.innerText = schedule[time].place;
                td.appendChild(span);
            }
        }
    }
};
