// 從教學務系統取得課程資料
() => {
    let get = (id) => frames["top"].frames["mainFrame"].frames[0]["mainFrame"].document.getElementById(id).innerText,
        data = {};
    data[get("M_COSID")] = {
        name: get("M_CH_LESSON_CURRI_EXPL"),
        teacher: get("M_LECTR_TCH_CH"),
        time: get("M_SEG").split(","),
        place: get("M_CLSSRM_ID").split(","),
    };
    return JSON.stringify(data);
};

window.CLASS_INFO = {};

window.get_data = (id) => {
    const doc = window.frames["top"].frames["mainFrame"].frames[0]["mainFrame"].document;
    let e = doc.getElementById(id);
    // console.log(e);
    if (!e) return "";
    return e.innerText || e.value;
};

window.todo = () => {
    let ret = {
        pkno: get_data("M_PKNO"),
        type: get_data("LESSON_TYPE"),
        semster: get_data("AYEARSMS"),
        code: get_data("M_COSID"),
        name: get_data("M_CH_LESSON_CURRI_EXPL"),
        department: get_data("M_FACULTY_NAME"),
        lecturer: get_data("M_LECTR_TCH_CH"),
        grade: get_data("M_GRADE"),
        time: get_data("M_SEG").split(","),
        classroom: get_data("M_CLSSRM_ID").split(","),
        MUST: get_data("M_MUST"),
        credit: get_data("M_CRD"),
        COSTERM: get_data("M_COSTERM"),
        objective: get_data("M_CH_TARGET"),
        outline: get_data("M_CH_OBJECT"),
        teaching_method: get_data("M_CH_TEACH"),
        syllabus: get_data("M_CH_TEACHSCH"),
        evaluation: get_data("M_CH_TYPE"),
    };

    window.CLASS_INFO[ret.pkno] = ret;
    return ret;
};

JSON.stringify(CLASS_INFO);
