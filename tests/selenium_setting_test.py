# -*- coding: utf-8 -*-
from selenium.webdriver.firefox.webdriver import WebDriver
from selenium.webdriver.common.action_chains import ActionChains
import time

success = True
wd = WebDriver()
wd.implicitly_wait(60)

def is_alert_present(wd):
    try:
        wd.switch_to_alert().text
        return True
    except:
        return False

try:
    wd.get("https://capstone-settlers.herokuapp.com/")
    if not ("Tutorial" in wd.find_element_by_tag_name("html").text):
        success = False
        print("verifyTextPresent failed")
    if not ("Settings" in wd.find_element_by_tag_name("html").text):
        success = False
        print("verifyTextPresent failed")
    wd.find_element_by_link_text("Back").click()
finally:
    wd.quit()
    if not success:
        raise Exception("Test failed.")
