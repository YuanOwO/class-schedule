const WEEKDAYS = "一二三四五六日";

const TIME = [
    "第零節\n06:20\n~\n08:10",
    "第一節\n08:20\n~\n09:10",
    "第二節\n09:20\n~\n10:10",
    "第三節\n10:20\n~\n11:10",
    "第四節\n11:15\n~\n12:05",
    "第五節\n12:10\n~\n13:00",
    "第六節\n13:10\n~\n14:00",
    "第七節\n14:10\n~\n15:00",
    "第八節\n15:10\n~\n16:00",
    "第九節\n16:05\n~\n16:55",
    "第十節\n17:30\n~\n18:20",
    "第十一節\n18:30\n~\n19:20",
    "第十二節\n19:25\n~\n20:15",
    "第十三節\n20:20\n~\n21:10",
    "第十四節\n21:15\n~\n22:05",
];

const BUILDINGS = {
    AAC: "水生動物實驗中心",
    ADM: "行政大樓",
    ADM001: "海洋廳",
    ADM002: "第一演講廳",
    ADM003: "第二演講廳",
    BOH: "人文大樓",
    CC3: "電算中心三樓",
    CC4: "電算中心四樓",
    "CE-": "工學院大樓",
    CLS: "生命科學院館",
    ECG: "電資暨綜合教學大樓",
    EE1: "電機一館",
    EE2: "電機二館",
    FRB: "第一餐廳",
    FSB: "食安所館",
    FSH: "環漁系館",
    GH1: "綜合一館",
    GH2: "綜合二館",
    GH3: "綜合三館",
    GRC: "綜合研究中心",
    GYM: "體育館",
    HR1: "河工一館",
    HR2: "河工二館",
    HRE: "海工館",
    INS: "資工系館",
    IVY: "沛華大樓",
    LIB: "圖書館",
    MAF: "海事大樓",
    MEA: "機械A館",
    MEB: "機械B館",
    MFE: "食科工程館",
    MFS: "食品科學館",
    "MZ-": "馬祖校區教學大樓",
    NAV: "商船大樓",
    NVA: "造船系館",
    OCE: "海洋系館",
    ODB: "海大意象館(海洋夢想基地)",
    SAC: "學生活動中心",
    SAH: "海空大樓",
    SPF: "體育場地",
    STA: "育樂館",
    STM: "航管大樓",
    TEC: "延平技術大樓",
    UAH: "空蝕水槽",
    ONL: "線上課程", // ONLINE
};
// 樓館備註
// 體育場地包括：
//     籃球場、高爾夫練習場、排球場、
//     操場、網球場、游泳池、健身房
// 行政大樓包括：
//     ADM001 海洋廳
//     ADM002 第一演講廳
//     ADM003 第二演講廳

const MODAL_TITLE = {
    pkno: "",
    type: "",
    semster: "學期",
    code: "課程代碼",
    name: "課程名稱",
    department: "開課系所",
    lecturer: "教師",
    grade: "班級",
    credit: "學分",
    time: "上課時間",
    classroom: "上課地點",
    MUST: "選課類別",
    COSTERM: "開課學期",
    objective: "教學目標",
    outline: "課程大綱",
    teaching_method: "教學方式",
    syllabus: "教學進度",
    evaluation: "評量方式",
};

const MODEL_FILEDS = Object.keys(MODAL_TITLE).filter((key) => key !== "pkno" && key !== "type" && key !== "semster");

const OUTLINE_FILEDS = ["objective", "outline", "teaching_method", "syllabus", "evaluation"];
