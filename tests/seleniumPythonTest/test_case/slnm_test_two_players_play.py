__author__ = 'QSG'
import os
import sys
import new
import unittest
from selenium import webdriver
from sauceclient import SauceClient
import time

# from environment variables
USERNAME = "sumnerfit"
ACCESS_KEY = "e8a11001-6685-43c4-901b-042e862a93f4"
sauce = SauceClient(USERNAME, ACCESS_KEY)
browsers = [{"platform": "Mac OS X 10.9",
             "browserName": "chrome",
             "version": "31"},
            {"platform": "Windows 8.1",
             "browserName": "internet explorer",
             "version": "11"}]

def on_platforms(platforms):
    def decorator(base_class):
        module = sys.modules[base_class.__module__].__dict__
        for i, platform in enumerate(platforms):
            d = dict(base_class.__dict__)
            d['desired_capabilities'] = platform
            name = "%s_%s" % (base_class.__name__, i + 1)
            module[name] = new.classobj(name, (base_class,), d)
    return decorator


# @on_platforms(browsers) #Comment this line when do the test locally
class SettlerSeleniumTest(unittest.TestCase):
    def setUp(self):

        #This is for saucelab test, comment this fragment of codes when test locally
        # self.desired_capabilities['name'] = self.id()
        # sauce_url = "http://%s:%s@ondemand.saucelabs.com:80/wd/hub"
        # self.driver = webdriver.Remote(
        #     desired_capabilities=self.desired_capabilities,
        #     command_executor=sauce_url % (USERNAME, ACCESS_KEY)
        # )
        #
        # self.driver_player2=webdriver.Remote(
        #     desired_capabilities=self.desired_capabilities,
        #     command_executor=sauce_url % (USERNAME, ACCESS_KEY)
        # )

        #This is for locally test, comment this fragment of codes when test on saucelab
        self.driver=webdriver.Firefox()
        self.driver_player2=webdriver.Firefox()


    #Test set players name, initialize the board for both players
    def test_game_start(self):
        success=True
        wd=self.driver
        handle_main=wd.current_window_handle
        wd.get("https://capstone-settlers.herokuapp.com/?test=true")
        wd.find_element_by_xpath("//div[@class='popup_inner']//div[.='Play']").click()
        wd.implicitly_wait(1)
        wd.find_element_by_id("txt_player1").click()
        wd.find_element_by_id("txt_player1").send_keys("Player1")
        wd.find_element_by_css_selector("span.player_text").click()
        wd.implicitly_wait(1)
        driver_player2=self.driver_player2
        handle_assist=driver_player2.current_window_handle
        driver_player2.get("https://capstone-settlers.herokuapp.com/?test=true")
        driver_player2.find_element_by_xpath("//div[@class='popup_inner']//div[.='Play']").click()
        driver_player2.implicitly_wait(1)
        driver_player2.find_element_by_id('txt_player1').click()
        driver_player2.find_element_by_id('txt_player1').send_keys("Player2")
        driver_player2.find_element_by_css_selector("span.player_text").click()
        time.sleep(5)
        # driver_player2.implicitly_wait(40)
        # wd.refresh()
        wd.switch_to_window(handle_main)
        # wd.implicitly_wait(20)
        get_start=wd.find_element_by_css_selector("div.btn.btn-info")

        wd.implicitly_wait(80)
        print wd.find_element_by_css_selector("div.btn.btn-info").text
        get_start.click()


        # wd.find_element_by_class_name("btn btn-info").click()
        self.assertTrue(success)

    #http://capstone-settlers.herokuapp.com/?startWithCards=20?fixedDice=true
    def test_game_drag_object_to_hex(self):



    def tearDown(self):
        #Comment this fragment of codes when test locally
        # print("Link to your job: https://saucelabs.com/jobs/%s" % self.driver.session_id)
        # try:
        #     if sys.exc_info() == (None, None, None):
        #         sauce.jobs.update_job(self.driver.session_id, passed=True)
        #         print "Test passed, sessionId: %s" %self.driver.session_id
        #     else:
        #         sauce.jobs.update_job(self.driver.session_id, passed=False)
        #         print "Test failed, sessionId: %s" %self.driver.session_id
        # finally:
        #     self.driver.quit()
        #     self.driver_player2.quit()
        #Comment this fragment of codes when test on saucelab.
        # self.driver.quit()
        # self.driver_player2.quit()

if __name__ == '__main__':
    unittest.main()