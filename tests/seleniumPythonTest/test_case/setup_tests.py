__author__ = 'Craig Walker'

import sys
import json
import requests
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from sauceclient import SauceClient
from multiprocessing import Pool
from selenium.webdriver.common.action_chains import ActionChains

# code needs reworking to remove global variable
test_results = []
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
        {'browserName':'firefox',
        'platform':'Windows 10',
        'screenResolution' : '1280x1024',
        'name': 'Windows 10 - Firefox',
        'screenResolution' : '1280x1024',
        'version': '54.0',}]#,
        # {'browserName':'microsoftedge',
        # 'platform':'Windows 10',
        # 'name': 'Windows 10 - Microsoft Edge',
        # 'screenResolution' : '1280x1024',
        # 'version': '15',},
        # {'browserName':'firefox',
        # 'name': 'MacOS 10.12 - Firefox',
        # 'screenResolution' : '1024x768',
        # 'platform':'Mac 10.12',
        # 'version': '54.0',},

# desired_caps_complete = [
#         {'browserName':'firefox',
#         'platform':'Windows 10',
#         'name': 'Windows 10 - Firefox',
#         'startversion':4,
#         'endversion': 55
#         },
#         {'browserName':'chrome',
#         'platform':'Windows 10',
#         'name': 'Windows 10 - Chrome',
#         'startversion':26,
#         'endversion': 60},
#         {'browserName':'InternetExplorer',
#         'platform':'Windows 10',
#         'name': 'Windows 10 - Internet Explorer',
#         'startversion':11,
#         'endversion': 11},
#         {'browserName':'MicrosoftEdge',
#         'platform':'Windows 10',
#         'name': 'Windows 10 - Edge',
#         'startversion':13,
#         'endversion': 15},
#         {'browserName':'firefox',
#         'platform':'Windows 8.1',
#         'name': 'Windows 8.1 - Firefox',
#         'startversion':4,
#         'endversion': 55
#         },
#         {'browserName':'chrome',
#         'platform':'Windows 8.1',
#         'name': 'Windows 8.1 - Chrome',
#         'startversion':26,
#         'endversion': 60},
#         {'browserName':'InternetExplorer',
#         'platform':'Windows 8.1',
#         'name': 'Windows 8.1 - Internet Explorer',
#         'startversion':11,
#         'endversion': 11},
#         {'browserName':'firefox',
#         'platform':'Windows 8',
#         'name': 'Windows 8 - Firefox',
#         'startversion':4,
#         'endversion': 55
#         },
#         {'browserName':'chrome',
#         'platform':'Windows 8',
#         'name': 'Windows 8 - Chrome',
#         'startversion':26,
#         'endversion': 60},
#         {'browserName':'InternetExplorer',
#         'platform':'Windows 8',
#         'name': 'Windows 8 - Internet Explorer',
#         'startversion':10,
#         'endversion': 10
#         },
#         {'browserName':'firefox',
#         'platform':'Windows 7',
#         'name': 'Windows 7 - Firefox',
#         'startversion':4,
#         'endversion': 55},
#         {'browserName':'chrome',
#         'platform':'Windows 7',
#         'name': 'Windows 7 - Chrome',
#         'startversion':26,
#         'endversion': 60},
#         {'browserName':'InternetExplorer',
#         'platform':'Windows 7',
#         'name': 'Windows 7 - Internet Explorer',
#         'startversion':8,
#         'endversion': 11},
#         {'browserName':'Opera',
#         'platform':'Windows 7',
#         'name': 'Windows 7 - Opera',
#         'startversion':11,
#         'endversion': 12}
#         {'browserName':'Safari',
#         'platform':'Windows 7',
#         'name': 'Windows 7 - Safari',
#         'startversion':5,
#         'endversion': 5
#         },
#         {'browserName':'firefox',
#         'platform':'Mac 10.12',
#         'name': 'Mac 10.12 - Firefox',
#         'startversion':4,
#         'endversion': 55},
#         {'browserName':'chrome',
#         'platform':'Mac 10.12',
#         'name': 'Mac 10.12 - Chrome',
#         'startversion':27,
#         'endversion': 60},
#         {'browserName':'safari',
#         'platform':'Mac 10.12',
#         'name': 'Mac 10.12 - Safari',
#         'startversion':10,
#         'endversion': 10
#         },
#         {'browserName':'firefox',
#         'platform':'Mac 10.11',
#         'name': 'Mac 10.11 - Firefox',
#         'startversion':4,
#         'endversion': 45},
#         {'browserName':'chrome',
#         'platform':'Mac 10.11',
#         'name': 'Mac 10.11 - Chrome',
#         'startversion':27,
#         'endversion': 60},
#         {'browserName':'safari',
#         'platform':'Mac 10.11',
#         'name': 'Mac 10.11 - Safari',
#         'startversion':9,
#         'endversion': 10
#         },
#         {'browserName':'chrome',
#         'platform':'Mac 10.10',
#         'name': 'Mac 10.10 - Chrome',
#         'startversion':37,
#         'endversion': 60},
#         {'browserName':'safari',
#         'platform':'Mac 10.10',
#         'name': 'Mac 10.10 - Safari',
#         'startversion':8,
#         'endversion': 8
#         },
#         {'browserName':'firefox',
#         'platform':'Mac 10.9',
#         'name': 'Mac 10.9 - Firefox',
#         'startversion':4,
#         'endversion': 55},
#         {'browserName':'chrome',
#         'platform':'Mac 10.9',
#         'name': 'Mac 10.9 - Chrome',
#         'startversion':31,
#         'endversion': 60},
#         {'browserName':'safari',
#         'platform':'Mac 10.9',
#         'name': 'Mac 10.9 - Safari',
#         'startversion':7,
#         'endversion': 7
#         },
#          {'browserName':'firefox',
#         'platform':'Mac 10.8',
#         'name': 'Mac 10.8 - Firefox',
#         'startversion':4,
#         'endversion': 48},
#         {'browserName':'chrome',
#         'platform':'Mac 10.8',
#         'name': 'Mac 10.8 - Chrome',
#         'startversion':27,
#         'endversion': 49},
#         {'browserName':'safari',
#         'platform':'Mac 10.8',
#         'name': 'Mac 10.8 - Safari',
#         'startversion':6,
#         'endversion': 6
#         },
#         {'browserName':'firefox',
#         'platform':'Linux',
#         'name': 'Linux - Firefox',
#         'startversion':4,
#         'endversion': 45},
#         {'browserName':'chrome',
#         'platform':'Linux',
#         'name': 'Linux - Chrome',
#         'startversion':26,
#         'endversion': 48},
#         {'browserName':'opera',
#         'platform':'Linux',
#         'name': 'Linux - Opera',
#         'startversion':12,
#         'endversion': 12
#         }]

def get_desired_cap(desired_cap):
    USERNAME = "sumnerfit"
    ACCESS_KEY = "e8a11001-6685-43c4-901b-042e862a93f4"
    driver = webdriver.Remote(
        command_executor = 'http://'+USERNAME+':'+ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub',
        desired_capabilities = desired_cap)
    return driver

def buy_dev_card(desired_cap):
    try:
        print "set driver"
        driver = get_desired_cap(desired_cap)
        # wait=WebDriverWait(driver,10)

        # load website
        print "load website"
        driver.get("https://capstone-settlers.herokuapp.com/?players=2")
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
            driver.implicitly_wait(20)
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
            # driver.implicitly_wait(20)
            start_game = driver.find_element_by_id('get_started')
            start_game.click()

            # place second round settlement and road
            place_item(driver, "settlement_red_open_3", -610, 223)
            place_item(driver, "road_red_open_13", -581, 147)

## for use with 4 player testing once game is advanced
        # if playerID[0].get_attribute("src") == "https://capstone-settlers.herokuapp.com/images/player2.png":

            # driver.implicitly_wait(30)
            # start_game = driver.find_element_by_id('get_started')
            # start_game.click()
            # driver.implicitly_wait(5)
            # # place first round settlement and road
            # place_item(driver, "settlement_blue_open_4", -602, 180)
            # place_item(driver, "road_blue_open_14", -583, -220)

            # # finish round
            # finish_round = driver.find_elements_by_class_name('finishturnbutton')
            # finish_round[0].click()

            # # wait for second round
            # driver.implicitly_wait(30)
            # start_game = driver.find_element_by_id('get_started')
            # start_game.click()

            # # place second round settlement and road
            # place_item(driver, "settlement_blue_open_3", -471, -180)
            # driver.implicitly_wait(2)
            # place_item(driver, "road_blue_open_13", -498, -228)

        # if playerID[0].get_attribute("src") == "https://capstone-settlers.herokuapp.com/images/player3.png":
            # print "waiting..."
            # driver.implicitly_wait(50)
            # print 'finished waining...'
            # start_game = driver.find_element_by_id('get_started')
            # start_game.click()

            # # place first round settlement and road
            # place_item(driver, "settlement_green_open_4", -683, 112)
            # place_item(driver, "road_green_open_14", -653, 26)

            # # finish round
            # finish_round = driver.find_elements_by_class_name('finishturnbutton')
            # finish_round[0].click()

            # # wait for second round
            # driver.implicitly_wait(10)
            # start_game = driver.find_element_by_id('get_started')
            # start_game.click()

            # # place second round settlement and road
            # place_item(driver, "settlement_green_open_3", -387, 79)
            # place_item(driver, "road_green_open_13", -393, 89)


        print "finish round"
        #finish the round
        finish_round = driver.find_elements_by_class_name('finishturnbutton')
        finish_round[0].click()
        print "send to finish_testing"
        finish_testing(True, driver)
    except:
        finish_testing(False, driver)

def place_item(driver, item, offsetX, offsetY):
    print item, offsetX, offsetY
    source_item = driver.find_element_by_id(item)
    ActionChains(driver).move_to_element(source_item).click_and_hold().move_by_offset(offsetX, offsetY).release().perform()

def finish_testing(success, driver):
    print "Success - " + success

    #send result back to saucelab to update the tests
    sauce_client = SauceClient("YOUR_SAUCE_USERNAME", "YOUR_SAUCE_ACCESSKEY")
    sauce_client.jobs.update_job(driver.session_id, passed=success)


    # create etst results to be sent to Slack notifications
    comment = "Test FAILED - <https://saucelabs.com/jobs/%s" % driver.session_id + "|Watch the video> for details"
    if success:
        comment = "Test PASSED! - <https://saucelabs.com/jobs/%s" % driver.session_id + "|Watch the video> for details"

    global test_results
    test_results.append(comment)

    #write results to file

    print len(test_results)
    print len(desired_caps)
    if len(test_results) == len(desired_caps):
        print 'sending data...'
        webhook_url = 'https://hooks.slack.com/services/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'
        message = ""
        for result in test_results:
            message = message + "\n"+result

        slack_data = {'Setup test results': message}

        response = requests.post(webhook_url, data=json.dumps(slack_data), headers={'Content-Type': 'application/json'})
        if response.status_code != 200:
            raise ValueError( 'Request to slack returned an error %s, the response is:\n%s' % (response.status_code, response.text))

    driver.quit()


p = Pool()
async_result = p.map_async(buy_dev_card, desired_caps)
p.close()
p.join()