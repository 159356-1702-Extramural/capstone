__author__ = 'QSG'
import os
import sys
import new
import unittest
from selenium import webdriver
from sauceclient import SauceClient
import time
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
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
    testLocal=False

    def dragDrop(self,wd,dragObj,tarObj):
        dragger=wd.find_element_by_id(dragObj)
        target=wd.find_element_by_id(tarObj)
        print target.get_attribute('style')
        action=ActionChains(wd)
        # action.move_to_element(dragger).perform()
        # wd.implicitly_wait(80)
        #When draging a element, move the element to the position beside it first.
        action.click_and_hold(dragger).move_by_offset(10, 10) #When draging a element, move the element to the position beside it first.
        # wd.implicitly_wait(80)
        action.click_and_hold(dragger).move_to_element(target).release().perform()
        wd.implicitly_wait(80)
        time.sleep(3)
        # wait=WebDriverWait(wd,80)
        if (dragObj[:4]=='road'):
            # element=wait.until(wd.find_element_by_xpath("//div[@class='popup_inner']//div[.='Build road']"))
            # element.click()
            wd.find_element_by_xpath("//div[@class='popup_inner']//div[.='Build road']").click()


        elif(dragObj[:4]=='sett'):
            # element=wait.until(wd.find_element_by_xpath("//div[@class='popup_inner']//div[.='Build settlement']")
            # element.click()
            wd.find_element_by_xpath("//div[@class='popup_inner']//div[.='Build settlement']").click()
        else:
            # element=wait.until(wd.find_element_by_xpath("//div[@class='popup_inner']//div[.='Build city']"))
            # element.click()
            wd.find_element_by_xpath("//div[@class='popup_inner']//div[.='Build city']").click()
        # wd.implicitly_wait(80)
        time.sleep(2)



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


    def test_game_start(self):
        success=True
        wd=self.driver
        wd.get("https://capstone-settlers.herokuapp.com/?startWithCards=20&setup=skip")
        wd.find_element_by_id("play").click()
        wd.implicitly_wait(1)
        wd.find_element_by_id("txt_player1").click()
        wd.find_element_by_id("txt_player1").clear()
        wd.find_element_by_id("txt_player1").send_keys("Player1")
        wd.find_element_by_css_selector("span.player_text").click()
        wd.implicitly_wait(1)
        handle_main=wd.current_window_handle

        #Player2 start
        driver_player2=self.driver_player2
        driver_player2.get("https://capstone-settlers.herokuapp.com/?startWithCards=20&setup=skip")
        driver_player2.find_element_by_id("play").click()
        driver_player2.implicitly_wait(1)
        driver_player2.find_element_by_id("txt_player1").click()
        driver_player2.find_element_by_id("txt_player1").clear()
        driver_player2.find_element_by_id("txt_player1").send_keys("Player2")
        driver_player2.find_element_by_css_selector("span.player_text").click()
        time.sleep(5)

        #Player1 begin round
        wd.switch_to_window(handle_main)
        wd.find_element_by_xpath("//div[@class='popup_inner']//div[.='Begin Round']").click()
        wd.implicitly_wait(1)
        time.sleep(2)
        wd.find_element_by_xpath("//div[@class='popup_inner']//div[.='Begin Round']").click()
        wd.implicitly_wait(1)
        time.sleep(2)

        #Player1 drag and drop settlement and road
        # self.dragDrop(wd,"road_purple_open_14","road_21")
        # self.dragDrop(wd,"settlement_purple_open_4","node_13")
        # self.dragDrop(wd,"road_purple_open_13","road_16")
        # self.dragDrop(wd,"road_purple_open_12","road_8")
        # self.dragDrop(wd,"settlement_purple_open_3","node_5")
        # self.dragDrop(wd,"road_purple_open_11","road_37")
        # self.dragDrop(wd,"road_purple_open_10","road_48")
        # self.dragDrop(wd,"settlement_purple_open_2","node_34")
        # self.dragDrop(wd,"road_purple_open_9","road_50")
        # self.dragDrop(wd,"road_purple_open_8","road_61")
        # self.dragDrop(wd,"settlement_purple_open_1","node_44")
        # self.dragDrop(wd,"road_purple_open_7","road_63")
        # self.dragDrop(wd,"road_purple_open_6","road_70")
        # self.dragDrop(wd,"settlement_purple_open_0","node_53")
        # self.dragDrop(wd,"city_purple_open_3","node_24")

        #Player finish turn
        # wait=WebDriverWait(wd,80)
        # element=wait.until(wd.find_element_by_xpath("//div[@class='playerbutton']//div[.='Finish Turn']"))
        # element.click()
        wd.implicitly_wait(80)
        wd.find_element_by_xpath("//div[@class='playerbutton']//div[.='Finish Turn']").click()
        # wd.implicitly_wait(1)
        time.sleep(2)

        #Player2 begin round
        driver_player2.find_element_by_xpath("//div[@class='popup_inner']//div[.='Begin Round']").click()
        driver_player2.implicitly_wait(80)
        time.sleep(2)
        driver_player2.find_element_by_xpath("//div[@class='popup_inner']//div[.='Begin Round']").click()
        driver_player2.implicitly_wait(80)
        time.sleep(2)
        driver_player2.find_element_by_xpath("//div[@class='playerbutton']//div[.='Finish Turn']").click()
        driver_player2.implicitly_wait(80)
        time.sleep(2)

        #Player1 begin round and game over
        wd.switch_to_window(handle_main)
        # wait= WebDriverWait(wd,10)
        # element=wait.until(wd.find_element_by_xpath("//div[@class='popup_inner']//div[.='Begin Round']"))
        # element.click()
        wd.implicitly_wait(80)
        wd.find_element_by_xpath("//div[@class='popup_inner']//div[.='Begin Round']").click()
        wd.implicitly_wait(80)
        time.sleep(2)
        wd.find_element_by_xpath("//div[@class='end_row']/div[2]/div[1]/img").click()
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