__author__ = 'QSG'
import os
import sys
import new
import unittest
from selenium import webdriver
from sauceclient import SauceClient
import browserList

USERNAME = "sumnerfit"
ACCESS_KEY = "e8a11001-6685-43c4-901b-042e862a93f4"
sauce = SauceClient(USERNAME, ACCESS_KEY)
browsers =browserList.browsers()

def on_platforms(platforms):
    def decorator(base_class):
        module = sys.modules[base_class.__module__].__dict__
        for i, platform in enumerate(platforms):
            d = dict(base_class.__dict__)
            d['desired_capabilities'] = platform
            name = "%s_%s" % (base_class.__name__, i + 1)
            module[name] = new.classobj(name, (base_class,), d)
    return decorator

@on_platforms(browsers)
class SauceSampleTest(unittest.TestCase):
    def setUp(self):
        self.desired_capabilities['name'] = self.id()
        sauce_url = "http://%s:%s@ondemand.saucelabs.com:80/wd/hub"
        self.driver = webdriver.Remote(
            desired_capabilities=self.desired_capabilities,
            command_executor=sauce_url % (USERNAME, ACCESS_KEY)
        )
        self.driver.implicitly_wait(30)

    def test_check_title(self):
        driver=self.driver
        driver.get("https://capstone-settlers.herokuapp.com/")
        self.assertIn('Settlers of Massey', driver.title)


    def tearDown(self):
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

if __name__ == '__main__':
    unittest.main()