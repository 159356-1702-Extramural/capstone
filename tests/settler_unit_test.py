__author__ = 'QSG'
import unittest
from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait
from sauceclient import SauceClient

# from selenium.webdriver.support import expected_conditions as EC
# from selenium.webdriver.common.by import By


class SettlerTutorial(unittest.TestCase):

    def setUp(self):
        desired_cap = {
                        'platform': "Mac OS X 10.9",
                        'browserName': "chrome",
                        'version': "31",
                        }
        # self.driver=webdriver.Firefox()
        self.driver=webdriver.Remote(
            command_executor='http://sumnerfit:e8a11001-6685-43c4-901b-042e862a93f4@ondemand.saucelabs.com:80/wd/hub',
            desired_capabilities=desired_cap)

    def test_tutorial(self):
        driver=self.driver
        driver.get("https://capstone-settlers.herokuapp.com/")
        self.assertIn('Settlers of Massey', driver.title)
        eles=driver.find_elements_by_class_name('start_text')
        ele_tutorial=eles[1]
        ele_tutorial.click()
        wait=WebDriverWait(driver,10)
        title=wait.until(lambda driver: driver.find_element_by_tag_name('h1'))
        self.assertEqual(title.text,'Tutorial!')

    def tearDown(self):
        self.driver.close()

if __name__=="__main__":
    unittest.main()
