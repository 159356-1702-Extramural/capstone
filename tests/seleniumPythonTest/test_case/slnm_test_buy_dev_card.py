__author__ = 'Craig Walker'

import sys
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from sauceclient import SauceClient
from multiprocessing import Pool

USERNAME = "sumnerfit"
ACCESS_KEY = "e8a11001-6685-43c4-901b-042e862a93f4"
sauce = SauceClient(USERNAME, ACCESS_KEY)
desired_caps = [{'browserName':'firefox',
        'platform':'Windows 10',
        'name': 'Windows 10 - Firefox',
        'version': '54.0',},
        {'browserName':'firefox',
        'name': 'MacOS 10.12 - Firefox',
        'platform':'Mac 10.12',
        'version': '54.0',},
        { 'browserName':'firefox',
        'platform':'Linux',
        'name': 'Linux - Firefox',
        'version': '45.0',},
        {'browserName':'chrome',
        'platform':'Windows 10',
        'name': 'Windows 10 - Chrome',
        'version': '60.0',},
        {'browserName':'internet explorer',
        'platform':'Windows 10',
        'name': 'Windows 10 - Internet Explorer',
        'version': '11',},
        {'browserName':'microsoftedge',
        'platform':'Windows 10',
        'name': 'Windows 10 - Microsoft Edge',
        'version': '15',}]

def buy_dev_card(desired_cap):
  USERNAME = "sumnerfit"
  ACCESS_KEY = "e8a11001-6685-43c4-901b-042e862a93f4"
  driver = webdriver.Remote(
     command_executor = 'http://'+USERNAME+':'+ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub',
     desired_capabilities = desired_cap)
  driver.implicitly_wait(10)
  driver.get("http://www.google.com")
  if not "Google" in driver.title:
      raise Exception("Unable to load google page!")
  elem = driver.find_element_by_name("q")
  elem.send_keys("Sauce Labs")
  elem.submit()

  finish_testing(driver)  
  

def finish_testing(driver):
  print "Link to your job: https://saucelabs.com/jobs/%s" % driver.session_id
  try:
    if sys.exc_info() == (None, None, None):
        sauce.jobs.update_job(driver.session_id, passed=True)
        print "Test passed, sessionId: %s" %driver.session_id
    else:
      sauce.jobs.update_job(driver.session_id, passed=False)
      print "Test failed, sessionId: %s" %driver.session_id
  finally:
    driver.quit()

p = Pool()
async_result = p.map_async(buy_dev_card, desired_caps)
p.close()
p.join()
# for desired_cap in desired_caps:
#   pool.apply_async(buy_dev_card(get_driver(desired_cap, USERNAME, ACCESS_KEY)))
