__author__ = 'Craig Walker'

import sys
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from sauceclient import SauceClient
from multiprocessing import Pool
from selenium.webdriver.common.action_chains import ActionChains

USERNAME = "sumnerfit"
ACCESS_KEY = "e8a11001-6685-43c4-901b-042e862a93f4"
sauce = SauceClient(USERNAME, ACCESS_KEY)
desired_caps = [
        {'browserName':'firefox',
        'platform':'Windows 10',
        'screenResolution' : '1280x1024',
        'name': 'Windows 10 - Firefox',
        'screenResolution' : '1280x1024',
        'version': '54.0',},
        { 'browserName':'firefox',
        'platform':'Linux',
        'name': 'Linux - Firefox',
        'screenResolution' : '1024x768',
        'version': '45.0',},
        {'browserName':'chrome',
        'platform':'Windows 10',
        'name': 'Windows 10 - Chrome',
        'screenResolution' : '1280x1024',
        'version': '60.0',},
        {'browserName':'internet explorer',
        'platform':'Windows 10',
        'name': 'Windows 10 - Internet Explorer',
        'screenResolution' : '1280x1024',
        'version': '11',}]#,
        # {'browserName':'microsoftedge',
        # 'platform':'Windows 10',
        # 'name': 'Windows 10 - Microsoft Edge',
        # 'screenResolution' : '1280x1024',
        # 'version': '15',},
        # {'browserName':'firefox',
        # 'name': 'MacOS 10.12 - Firefox',
        # 'screenResolution' : '1024x768',
        # 'platform':'Mac 10.12',
        # 'version': '54.0',}]

def get_desired_cap(desired_cap):
  USERNAME = "sumnerfit"
  ACCESS_KEY = "e8a11001-6685-43c4-901b-042e862a93f4"
  driver = webdriver.Remote(
     command_executor = 'http://'+USERNAME+':'+ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub',
     desired_capabilities = desired_cap)
  return driver

def buy_dev_card(desired_cap):
  print "set driver"
  driver = get_desired_cap(desired_cap)
  # wait=WebDriverWait(driver,10)

  # load website
  print "load website"
  driver.get("https://capstone-settlers.herokuapp.com/?players=4")
  # driver.implicitly_wait(10)

  # click play button
  print "click play button"

  play = driver.find_element_by_id('play')
  play.click()

  print "add name"
  # add name to input
  playerInput = driver.find_element_by_id('txt_player1')
  playerInput.send_keys("player 1")

  # click
  print "click player button"
  start_game = driver.find_elements_by_class_name('player_button')
  start_game[0].click()
  print "click game start"

  print "find correct player actions"
  # find the correct player actions
  player =  driver.find_elements_by_class_name('player')
  playerID = player[0].find_elements_by_tag_name('img')

  print playerID[0].get_attribute("src")
  if playerID[0].get_attribute("src") == "https://capstone-settlers.herokuapp.com/images/player0.png":

    driver.implicitly_wait(10)
    start_game = driver.find_element_by_id('get_started')
    start_game.click()
    
    # place first round settlement and road
    place_item(driver, "settlement_purple_open_4", -540, 110)
    place_item(driver, "road_purple_open_14", -573, 29)

    # finish round
    finish_round = driver.find_elements_by_class_name('finishturnbutton')
    finish_round[0].click()

    # wait for second round
    driver.implicitly_wait(80)
    start_game = driver.find_element_by_id('get_started')
    start_game.click()

    # place second round settlement and road
    place_item(driver, "settlement_purple_open_3", -313, -80)
    place_item(driver, "road_purple_open_13", -392, 228)

  if playerID[0].get_attribute("src") == "https://capstone-settlers.herokuapp.com/images/player1.png":

    driver.implicitly_wait(20)
    start_game = driver.find_element_by_id('get_started')
    start_game.click()

    # place first round settlement and road
    place_item(driver, "settlement_red_open_4", -685, -62)
    place_item(driver, "road_red_open_14", -658, -100)

    # finish round
    finish_round = driver.find_elements_by_class_name('finishturnbutton')
    finish_round[0].click()

    # wait for second round
    driver.implicitly_wait(50)
    start_game = driver.find_element_by_id('get_started')
    start_game.click()

    # place second round settlement and road
    place_item(driver, "settlement_red_open_3", -610, 223)
    place_item(driver, "road_red_open_13", -581, 147)

  if playerID[0].get_attribute("src") == "https://capstone-settlers.herokuapp.com/images/player3.png":

    driver.implicitly_wait(50)
    start_game = driver.find_element_by_id('get_started')
    start_game.click()

    # place first round settlement and road
    place_item(driver, "settlement_green_open_4", -683, 112)
    place_item(driver, "road_green_open_14", -653, 26)

    # finish round
    finish_round = driver.find_elements_by_class_name('finishturnbutton')
    finish_round[0].click()

    # wait for second round
    driver.implicitly_wait(10)
    start_game = driver.find_element_by_id('get_started')
    start_game.click()

    # place second round settlement and road
    place_item(driver, "settlement_green_open_3", -387, 79)
    place_item(driver, "road_green_open_13", -393, 89)

  if playerID[0].get_attribute("src") == "https://capstone-settlers.herokuapp.com/images/player2.png":

    driver.implicitly_wait(30)
    start_game = driver.find_element_by_id('get_started')
    start_game.click()

    # place first round settlement and road
    place_item(driver, "settlement_blue_open_4", -608, -184)
    place_item(driver, "road_blue_open_14", -583, -220)

    # finish round
    finish_round = driver.find_elements_by_class_name('finishturnbutton')
    finish_round[0].click()

    # wait for second round
    driver.implicitly_wait(30)
    start_game = driver.find_element_by_id('get_started')
    start_game.click()

    # place second round settlement and road
    place_item(driver, "settlement_blue_open_3", -471, -180)
    place_item(driver, "road_blue_open_13", -498, -228)
  print "finish round"
  # #finish the round
  finish_round = driver.find_elements_by_class_name('finishturnbutton')
  finish_round[0].click()

  driver.implicitly_wait(30)
  finish_testing(driver)

def place_item(driver, item, offsetX, offsetY):
  print item, offsetX, offsetY
  source_item = driver.find_element_by_id(item)
  ActionChains(driver).move_to_element(source_item).click_and_hold().move_by_offset(offsetX, offsetY).release().perform()

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
