__author__ = 'QSG'
import os
import sys
import new
import unittest
from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait
from sauceclient import SauceClient
from threading import Thread
import time


# it's best to remove the hardcoded defaults and always get these values
# from environment variables
# This test file can only be run under local environment
# USERNAME = "sumnerfit"
# ACCESS_KEY = "e8a11001-6685-43c4-901b-042e862a93f4"
# sauce = SauceClient(USERNAME, ACCESS_KEY)
# browsers = [{"platform": "Mac OS X 10.9",
#              "browserName": "chrome",
#              "version": "31"},
#             {"platform": "Windows 8.1",
#              "browserName": "internet explorer",
#              "version": "11"}]
#
# def on_platforms(platforms):
#     def decorator(base_class):
#         module = sys.modules[base_class.__module__].__dict__
#         for i, platform in enumerate(platforms):
#             d = dict(base_class.__dict__)
#             d['desired_capabilities'] = platform
#             name = "%s_%s" % (base_class.__name__, i + 1)
#             module[name] = new.classobj(name, (base_class,), d)
#     return decorator

# @on_platforms(browsers)
class SauceSampleTest(unittest.TestCase):
    def setUp(self):
        # self.desired_capabilities['name'] = self.id()
        # sauce_url = "http://%s:%s@ondemand.saucelabs.com:80/wd/hub"
        # self.driver = webdriver.Remote(
        #     desired_capabilities=self.desired_capabilities,
        #     command_executor=sauce_url % (USERNAME, ACCESS_KEY)
        # )
        self.driver=webdriver.Firefox()

        # self.driver_assist=webdriver.Firefox()
        # self.driver_assist.get("https://capstone-settlers.herokuapp.com/")
        # self.driver_assist.find_element_by_xpath("//div[@class='popup_inner']//div[.='Play']").click()
        # self.driver_assist.implicitly_wait(1)
        # self.driver_assist.find_element_by_id('txt_player1').click()
        # self.driver_assist.find_element_by_id('txt_player1').send_keys("Player2")
        # self.driver_assist.find_element_by_css_selector("span.player_text").click()
        # self.driver_assist.implicitly_wait(1)
        # self.driver_assist.find_element_by_css_selector("div.btn.btn-info").click()
        # self.driver_assist.implicitly_wait(20)

        # self.driverA=webdriver.Firefox()
        # self.driverB=webdriver.Firefox()
        # self.driverC=webdriver.Firefox()
        # self.driver_assist.implicitly_wait(1)

    def test_game_start(self):
        success=True
        wd=self.driver
        handle_main=wd.current_window_handle
        wd.get("https://capstone-settlers.herokuapp.com/")
        wd.find_element_by_xpath("//div[@class='popup_inner']//div[.='Play']").click()
        wd.implicitly_wait(1)
        wd.find_element_by_id("txt_player1").click()
        wd.find_element_by_id("txt_player1").send_keys("Player1")
        wd.find_element_by_xpath("//div[@class='popup_inner']/div[3]/div/i").click()
        wd.implicitly_wait(1)
        driver_assist=webdriver.Firefox()
        handle_assist=driver_assist.current_window_handle
        driver_assist.get("https://capstone-settlers.herokuapp.com/")
        driver_assist.find_element_by_xpath("//div[@class='popup_inner']//div[.='Play']").click()
        driver_assist.implicitly_wait(1)
        driver_assist.find_element_by_id('txt_player1').click()
        driver_assist.find_element_by_id('txt_player1').send_keys("Player2")
        driver_assist.find_element_by_css_selector("span.player_text").click()
        time.sleep(5)
        # driver_assist.implicitly_wait(40)
        # wd.refresh()
        wd.switch_to_window(handle_main)
        # wd.implicitly_wait(20)
        get_start=wd.find_element_by_css_selector("div.btn.btn-info")

        wd.implicitly_wait(80)
        print wd.find_element_by_css_selector("div.btn.btn-info").text
        get_start.click()

        driver_assist.quit()

        # wd.find_element_by_class_name("btn btn-info").click()
        self.assertTrue(success)



    def tearDown(self):
        # print("Link to your job: https://saucelabs.com/jobs/%s" % self.driver.session_id)
        # try:
        #     if sys.exc_info() == (None, None, None):
        #         sauce.jobs.update_job(self.driver.session_id, passed=True)
        #         print "Test passed, sessionId: %s" %self.driver.session_id
        #     else:
        #         sauce.jobs.update_job(self.driver.session_id, passed=False)
        #         print "Test failed, sessionId: %s" %self.driver.session_id
        # finally:
        self.driver.quit()


if __name__ == '__main__':
    unittest.main()