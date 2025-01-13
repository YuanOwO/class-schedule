// 從教學務系統取得課程資料
(() => {
    let get = (id) => frames["top"].frames["mainFrame"].frames[0]["mainFrame"].document.getElementById(id).innerText,
        data = {};
    data[get("M_COSID")] = {
        name: get("M_CH_LESSON_CURRI_EXPL"),
        teacher: get("M_LECTR_TCH_CH"),
        time: get("M_SEG").split(","),
        place: get("M_CLSSRM_ID").split(","),
    };
    return JSON.stringify(data);
})();
