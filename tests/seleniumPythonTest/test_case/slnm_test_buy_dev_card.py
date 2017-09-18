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
        'version': '45.0',}]#,
        # {'browserName':'firefox',
        # 'name': 'MacOS 10.12 - Firefox',
        # 'screenResolution' : '1024x768',
        # 'platform':'Mac 10.12',
        # 'version': '54.0',},
        # {'browserName':'chrome',
        # 'platform':'Windows 10',
        # 'name': 'Windows 10 - Chrome',
        # 'screenResolution' : '1280x1024',
        # 'version': '60.0',},
        # {'browserName':'internet explorer',
        # 'platform':'Windows 10',
        # 'name': 'Windows 10 - Internet Explorer',
        # 'screenResolution' : '1280x1024',
        # 'version': '11',},
        # {'browserName':'microsoftedge',
        # 'platform':'Windows 10',
        # 'name': 'Windows 10 - Microsoft Edge',
        # 'screenResolution' : '1280x1024',
        # 'version': '15',}]

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
  driver.get("https://capstone-settlers.herokuapp.com/")
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
  # when get started, place a settlement and a road
  # - look for placed elements
  print "click game start"

  WebDriverWait(driver, 20).until(EC.presence_of_element_located(By.CLASS_NAME("//*[@class='popup'][contains(@style, 'display: block')]")))
  start_game = driver.find_element_by_id('get_started')
  start_game.click()

  print "find correct player actions"
  # find the correct player actions
  player =  driver.find_elements_by_class_name('player')
  playerID = player[0].find_elements_by_tag_name('img')

  print playerID[0].get_attribute("src")
  if playerID[0].get_attribute("src") == "https://capstone-settlers.herokuapp.com/images/player0.png":
    print "player 0"
    source_purple = driver.find_element_by_id("settlement_purple_open_4")
    ActionChains(driver).move_to_element(source_purple).click_and_hold().move_by_offset(-470, 0).release().perform()

    print "moved settlement for player 0"

    source_purple_road = driver.find_element_by_id("road_purple_open_14")
    ActionChains(driver).move_to_element(source_purple_road).click_and_hold().move_by_offset(-439, -106).release().perform()

    # finish round
    finish_round = driver.find_elements_by_class_name('finishturnbutton')
    finish_round[0].click()

    popup = start_game = wait.until(lambda driver: driver.find_elements_by_class_name('popup'))
    # wait for other players to place
    # popup = WebDriverWait(driver, 120).until(EC.visibility_of_element_located((By.Id, 'popup')))
    # start_game = driver.find_element_by_id('get_started')
    # start_game.click()

    print "moved road for player 0"

    source_purple = driver.find_element_by_id("settlement_purple_open_4")

    print "found source_purple"
    ActionChains(driver).move_to_element(source_purple).click_and_hold().move_by_offset(-540, -77).release().perform()

    print "moved settlement for player 0"

    source_purple_road = driver.find_element_by_id("road_purple_open_14")
    ActionChains(driver).move_to_element(source_purple_road).click_and_hold().move_by_offset(-439, -106).release().perform()

  if playerID[0].get_attribute("src") == "https://capstone-settlers.herokuapp.com/images/player1.png":

    source_purple = driver.find_element_by_id('settlement_red_open_4')
    #dest_element = driver.find_element_by_id('node_17')
    ActionChains(driver).move_to_element(source_element).move_by_offset(-550, 346).click().perform()
    print "moved settlement for player 1"
  # #move a settlement onto the board

  print "finish round"
  # #finish the round
  finish_round = driver.find_elements_by_class_name('finishturnbutton')
  finish_round[0].click()

  # driver.implicitly_wait(10)
  # driver.get("http://www.google.com")
  # if not "Google" in driver.title:
  #     raise Exception("Unable to load google page!")
  # elem = driver.find_element_by_name("q")
  # elem.send_keys("Sauce Labs")
  # elem.submit()

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
