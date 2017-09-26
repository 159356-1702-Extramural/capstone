__author__ = 'QSG'
import os
import sys
import new
import unittest
from selenium import webdriver
from sauceclient import SauceClient
import time
from selenium.webdriver.common.action_chains import ActionChains
import browserList

USERNAME = "sumnerfit"
ACCESS_KEY = "e8a11001-6685-43c4-901b-042e862a93f4"
sauce = SauceClient(USERNAME, ACCESS_KEY)
browsers = browserList.browsers()

def on_platforms(platforms):
    def decorator(base_class):
        module = sys.modules[base_class.__module__].__dict__
        for i, platform in enumerate(platforms):
            d = dict(base_class.__dict__)
            d['desired_capabilities'] = platform
            name = "%s_%s" % (base_class.__name__, i + 1)
            module[name] = new.classobj(name, (base_class,), d)
    return decorator


@on_platforms(browsers) #Comment this line when do the test locally
class SettlerSeleniumTest(unittest.TestCase):
    testLocal=True
    def setUp(self):

        if not self.testLocal:
            self.desired_capabilities['name'] = self.id()
            sauce_url = "http://%s:%s@ondemand.saucelabs.com:80/wd/hub"
            self.driver = webdriver.Remote(
                desired_capabilities=self.desired_capabilities,
                command_executor=sauce_url % (USERNAME, ACCESS_KEY)
            )

            self.driver_player2=webdriver.Remote(
                desired_capabilities=self.desired_capabilities,
                command_executor=sauce_url % (USERNAME, ACCESS_KEY)
            )
        else:
            self.driver=webdriver.Firefox()
            self.driver_player2=webdriver.Firefox()


    def test_dice_roll(self):
        success=True
        wd=self.driver
        wd.get("https://capstone-settlers.herokuapp.com/?fixedDice=true&setup=skip")
        wd.find_element_by_id("play").click()
        wd.implicitly_wait(1)
        wd.find_element_by_id("txt_player1").click()
        wd.find_element_by_id("txt_player1").clear()
        wd.find_element_by_id("txt_player1").send_keys("1")
        wd.find_element_by_css_selector("span.player_text").click()
        wd.implicitly_wait(1)
        handle_main=wd.current_window_handle

        #Player2 start
        driver_player2=self.driver_player2
        driver_player2.get("https://capstone-settlers.herokuapp.com/?fixedDice=true&setup=skip")
        driver_player2.find_element_by_id("play").click()
        driver_player2.implicitly_wait(1)
        driver_player2.find_element_by_id("txt_player1").click()
        driver_player2.find_element_by_id("txt_player1").clear()
        driver_player2.find_element_by_id("txt_player1").send_keys("2")
        driver_player2.find_element_by_css_selector("span.player_text").click()
        time.sleep(5)

        #Player1 continue
        wd.switch_to_window(handle_main)
        wd.find_element_by_xpath("//div[@class='popup_inner']//div[.='Begin Round']").click()
        wd.implicitly_wait(1)
        time.sleep(1)
        wd.find_element_by_xpath("//div[@class='popup_inner']//div[.='Begin Round']").click()
        wd.implicitly_wait(1)
        wd.find_element_by_xpath("//div[@class='playerbutton']//div[.='Finish Turn']").click()
        wd.implicitly_wait(1)
        time.sleep(1)

        #Player2 continue
        # driver_player2.switch_to_window(handle_main)
        driver_player2.find_element_by_xpath("//div[@class='popup_inner']//div[.='Begin Round']").click()
        driver_player2.implicitly_wait(5)
        time.sleep(1)
        driver_player2.find_element_by_xpath("//div[@class='popup_inner']//div[.='Begin Round']").click()
        driver_player2.implicitly_wait(1)
        driver_player2.find_element_by_xpath("//div[@class='playerbutton']//div[.='Finish Turn']").click()
        driver_player2.implicitly_wait(5)
        time.sleep(1)

        #Player1 continue
        wd.switch_to_window(handle_main)
        wd.find_element_by_xpath("//div[@class='popup_inner']//div[.='Begin Round']").click()
        wd.implicitly_wait(1)
        wd.find_element_by_css_selector("div.box.sheep").click()

        time.sleep(5)

        self.assertTrue(success)

    def tearDown(self):
        if not self.testLocal:
            print("Link to your job: https://saucelabs.com/jobs/%s" % self.driver.session_id)
            try:
                if sys.exc_info() == (None, None, None):
                    sauce.jobs.update_job(self.driver.session_id, passed=True)
                    print "Test passed, sessionId: %s" %self.driver.session_id
                else:
                    sauce.jobs.update_job(self.driver.session_id, passed=False)
                    print "Test failed, sessionId: %s" %self.driver.session_id
            finally:
                self.driver.quit()
                self.driver_player2.quit()
        else:
            self.driver.quit()
            self.driver_player2.quit()

if __name__ == '__main__':
    unittest.main()