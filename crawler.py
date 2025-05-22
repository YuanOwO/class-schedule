import atexit
import json
from base64 import b64encode
from time import sleep

from selenium.webdriver import Chrome, ChromeOptions, ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.expected_conditions import (
    element_to_be_clickable,
    presence_of_element_located,
    visibility_of_element_located,
)
from selenium.webdriver.support.select import Select
from selenium.webdriver.support.wait import WebDriverWait

with open("data/faculty.json", "r", encoding="utf-8") as f:
    faculty_data = json.load(f)

# https://ais.ntou.edu.tw/outside.aspx?mainPage=LwBBAHAAcABsAGkAYwBhAHQAaQBvAG4ALwBUAEsARQAvAFQASwBFADIAMgAvAFQASwBFADIAMgAxADUAXwAuAGEAcwBwAHgAPwBwAHIAbwBnAGMAZAA9AFQASwBFADIAMgAxADUA


class MyDriver(Chrome):
    def __init__(self):
        service = ChromeService(executable_path="driver/chromedriver.exe")
        options = ChromeOptions()

        super().__init__(options, service)
        self.set_window_position(3000, 10)

    def setup(self):
        mainpage = "/Application/TKE/TKE22/TKE2215_.aspx?progcd=TKE2215"
        mainpage = b64encode(mainpage.encode("utf-16le")).decode("utf-8")
        self.get("https://ais.ntou.edu.tw/outside.aspx?mainPage=" + mainpage)

        # 等待主畫面的 iframe 加載
        frame = WebDriverWait(self, 10).until(presence_of_element_located((By.XPATH, '//iframe[@name="mainFrame"]')))
        self.switch_to.frame(frame)

        # 等待主畫面加載完成 (等待標題出現)
        WebDriverWait(self, 10).until(presence_of_element_located((By.XPATH, '//*[@ml="PL_TKE2211_課程課表查詢"]')))

        # 調整每一頁的顯示數量
        self.find_element(By.ID, "PC_PageSize").send_keys("300" + Keys.DELETE + Keys.DELETE)
        self.find_element(By.ID, "PC_ShowRows").click()

    def teardown(self):
        self.quit()

    def __enter__(self):
        self.setup()
        return self
        # return super().__enter__()

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.teardown()
        # return super().__exit__(exc_type, exc_val, exc_tb)


def get_all_options(driver: Chrome):
    data = []

    deg_select = Select(driver.find_element(By.ID, "Q_DEGREE_CODE"))  # 部別
    options = [(opt.get_attribute("value"), opt.text) for opt in deg_select.options]

    for i, degree in enumerate(options):
        print(degree)
        deg_select = Select(driver.find_element(By.ID, "Q_DEGREE_CODE"))  # 部別
        deg_select.select_by_index(i)

        sleep(0.5)  # 等待選擇的部別加載

        fac_select = Select(driver.find_element(By.ID, "Q_FACULTY_CODE"))  # 開課系所

        data.append(
            {
                "degree": {
                    "code": degree[0],
                    "name": degree[1],
                },
                "faculties": [
                    {
                        "code": opt.get_attribute("value"),
                        "name": opt.text,
                    }
                    for opt in fac_select.options
                ],
            }
        )

    return data


def select_query(
    driver: Chrome,
    faculty: str | None = None,
    grade: str | None = None,
    classid: str | None = None,
):
    # 先選擇部別
    select = Select(driver.find_element(By.ID, "Q_DEGREE_CODE"))
    select.select_by_value(faculty_data[faculty][0])

    # 等待開課系所的選項加載
    WebDriverWait(driver, 10).until(
        presence_of_element_located((By.XPATH, f'//select[@id="Q_FACULTY_CODE"]/option[@value="{faculty}"]'))
    )

    select = Select(driver.find_element(By.ID, "Q_FACULTY_CODE"))
    select.select_by_value(faculty)

    if grade:
        select = Select(driver.find_element(By.ID, "Q_GRADE"))
        select.select_by_value(grade)

    if classid:
        select = Select(driver.find_element(By.ID, "Q_CLASSID"))
        select.select_by_value(classid)

    driver.find_element(By.ID, "QUERY_BTN1").click()

    # 等待查詢結果加載完成
    WebDriverWait(driver, 10).until_not(visibility_of_element_located((By.ID, "__LOADINGBAR")))

    print("查詢完成")


def get_data(driver: Chrome, id: str) -> str:
    elem = driver.find_element(By.ID, id)

    if not elem:
        return ""

    return elem.text or elem.get_attribute("value")


def get_course_info(driver: Chrome, path_id: str):
    # print(path_id)
    a = driver.find_element(By.ID, path_id)
    print(a.get_property("outerHTML"))
    WebDriverWait(driver, 10).until(element_to_be_clickable(a))
    a.click()

    # 等待進入課程資訊頁面
    frame = WebDriverWait(driver, 10).until(presence_of_element_located((By.TAG_NAME, "iframe")))
    driver.switch_to.frame(frame)
    driver.switch_to.frame(driver.find_element(By.ID, "mainIFrame"))

    # 抓取課程資訊

    ret = {
        "pkno": get_data(driver, "M_PKNO"),
        "type": get_data(driver, "LESSON_TYPE"),
        "semster": get_data(driver, "AYEARSMS"),
        "code": get_data(driver, "M_COSID"),
        "name": get_data(driver, "M_CH_LESSON_CURRI_EXPL"),
        "department": get_data(driver, "M_FACULTY_NAME"),
        "lecturer": get_data(driver, "M_LECTR_TCH_CH"),
        "grade": get_data(driver, "M_GRADE"),
        "time": get_data(driver, "M_SEG").split(","),
        "classroom": get_data(driver, "M_CLSSRM_ID").split(","),
        "MUST": get_data(driver, "M_MUST"),
        "credit": get_data(driver, "M_CRD"),
        "COSTERM": get_data(driver, "M_COSTERM"),
        "objective": get_data(driver, "M_CH_TARGET"),
        "outline": get_data(driver, "M_CH_OBJECT"),
        "teaching_method": get_data(driver, "M_CH_TEACH"),
        "syllabus": get_data(driver, "M_CH_TEACHSCH"),
        "evaluation": get_data(driver, "M_CH_TYPE"),
    }

    # 關閉頁面
    driver.find_element(By.ID, "CLOSE_BTN1").click()

    # 返回查詢頁面
    driver.switch_to.parent_frame()
    driver.switch_to.parent_frame()

    return ret


def save_data(data: dict):
    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)


def get_all_courses(driver: Chrome):
    elems = driver.find_elements(By.CLASS_NAME, "pathLink")
    elems = [e.get_attribute("id") for e in elems]

    data = {}

    atexit.register(save_data, data)  # 發生錯誤時也會保存資料

    print(f"找到 {len(elems)} 筆資料")
    for elem in elems:
        info = get_course_info(driver, elem)
        data[info["pkno"]] = info

    print("資料抓取完成")
    save_data(data)

    atexit.unregister(save_data)  # 取消註冊


if __name__ == "__main__":
    with MyDriver() as driver:
        select_query(driver, "0507")
        get_all_courses(driver)

    # driver = setup()

    # get_all_courses(driver)

    # sleep(5)

    # teardown(driver)
