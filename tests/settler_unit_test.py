__author__ = 'QSG'
import unittest
from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# from selenium.webdriver.common.by import By

class SettlerTutorial(unittest.TestCase):

    def setUp(self):
        self.driver=webdriver.Firefox()

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
