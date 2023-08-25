function get_cls_data() {
    const xhr = new XMLHttpRequest();
    xhr.open("get", "./class.json", false);
    xhr.send();
    return JSON.parse(xhr.responseText);
}

export const classdata = get_cls_data(),
    table_size = [5, 15],
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
    ];

export function gen_schedule() {
    let schedule = {};
    // for (let i = 0; i < table_size[0]; i++)
    //     for (let j = 0; j < table_size[1]; j++)
    //         schedule[((i + 1) * 100 + j).toString()] = {};

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
}
