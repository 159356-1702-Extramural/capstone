# /**
#  *
#  * Selenium testing using Saucelabs
#  * https://www.saucelabs.com
#  *
#  * Basic automated tests to ensure functionality across all platforms
#  * (Create gameplay tests for all browsers and platforms)
#  *
#  * Selenium tests currently setup for quick testing of major browsers and Desktop OS's
#  *
#  */
# var comprehensiveTest = false;

# var assert = require('assert');
# var SauceLabs = require("saucelabs");
# var username = "sumnerfit";
# var accessKey = "e8a11001-6685-43c4-901b-042e862a93f4";
# var saucelabs = new SauceLabs({
#   username: username,
#   password: accessKey
# });

# var test = require('ava');
# var webdriver = require('selenium-webdriver');
# var drivers = [];

# webdriver.promise.USE_PROMISE_MANAGER = false;
# /**
#  * Create browser / platforms to test against here
#  * function formated driver_browser_os
#  *    i.e. driver_fx_xp = Firefox on Windows XP
#  * Note: version number coresponds to browser version number
#  *
#  * TODO: break down functions below to one function with an input array of platform/browers/version
#  *
#  * https://saucelabs.com/platforms
#  *
#  */

# //Super quick tests for setting up tests and not over loading saucelabs
# var superQuickTests = {
#   'Windows 10': {
#     'firefox': {
#       startVersion: 54,
#       endVersion: 55
#     },
#   }
# }

# // Quick tests hold multiple of 4 tests at any time for testing in parallel - currently 8 combos
# var quickTests = {
#   'Windows 10': {
#     'firefox': {
#       startVersion: 55,
#       endVersion: 55
#     },
#     'chrome': {
#       startVersion: 60,
#       endVersion: 60
#     },
#     'internet explorer': {
#       startVersion: 11,
#       endVersion: 11
#     },
#     'MicrosoftEdge': { //testing two versions here
#       startVersion: 14,
#       endVersion: 15
#     },
#   },
#   'Windows 8.1': {
#     'firefox': {
#       startVersion: 55,
#       endVersion: 55
#     },
#     'internet explorer': {
#       startVersion: 11,
#       endVersion: 11
#     }
#   },
#   'Linux': {
#     'firefox': {
#       startVersion: 45,
#       endVersion: 45
#     },
#     'chrome': {
#       startVersion: 48,
#       endVersion: 48
#     }
#   },
#   'Mac 10.12': {
#     'firefox': {
#       startVersion: 45,
#       endVersion: 45
#     },
#     'chrome': {
#       startVersion: 60,
#       endVersion: 60
#     },
#     'safari': {
#       startVersion: 10,
#       endVersion: 10
#     }
#   }
# }

# var comprehensiveTests = {
#   'Windows 10': {
#     'firefox': {
#       startVersion: 4,
#       endVersion: 55
#     },
#     'chrome': {
#       startVersion: 26,
#       endVersion: 60
#     },
#     'ie': {
#       startVersion: 11,
#       endVersion: 11
#     },
#     'edge': {
#       startVersion: 13,
#       endVersion: 15
#     }
#   },
#   'Windows 8.1': {
#     firefox: {
#       startVersion: 4,
#       endVersion: 55
#     },
#     chrome: {
#       startVersion: 26,
#       endVersion: 60
#     },
#     ie: {
#       startVersion: 11,
#       endVersion: 11
#     }
#   },
#   'Windows 8': {
#     firefox: {
#       startVersion: 4,
#       endVersion: 55
#     },
#     chrome: {
#       startVersion: 26,
#       endVersion: 60
#     },
#     ie: {
#       startVersion: 10,
#       endVersion: 10
#     }
#   },
#   'Windows 7': {
#     firefox: {
#       startVersion: 4,
#       endVersion: 55
#     },
#     chrome: {
#       startVersion: 26,
#       endVersion: 60
#     },
#     ie: {
#       startVersion: 8,
#       endVersion: 11
#     },
#     opera: {
#       startVersion: 11,
#       endVersion: 12
#     },
#     safari: {
#       startVersion: 5,
#       endVersion: 5
#     }
#   },
#   'Windows XP': {
#     firefox: {
#       startVersion: 4,
#       endVersion: 45
#     },
#     chrome: {
#       startVersion: 26,
#       endVersion: 49
#     },
#     ie: {
#       startVersion: 6,
#       endVersion: 8
#     },
#     opera: {
#       startVersion: 11,
#       endVersion: 12
#     }
#   },
#   'Mac 10.12': {
#     firefox: {
#       startVersion: 4,
#       endVersion: 45
#     },
#     chrome: {
#       startVersion: 27,
#       endVersion: 60
#     },
#     safari: {
#       startVersion: 10,
#       endVersion: 10
#     }
#   },
#   'Mac 10.11': {
#     firefox: {
#       startVersion: 4,
#       endVersion: 45
#     },
#     chrome: {
#       startVersion: 27,
#       endVersion: 60
#     },
#     safari: {
#       startVersion: 9,
#       endVersion: 10
#     }
#   },
#   'Mac 10.10': {
#     chrome: {
#       startVersion: 37,
#       endVersion: 60
#     },
#     safari: {
#       startVersion: 8,
#       endVersion: 8
#     }
#   },
#   'Mac 10.9': {
#     firefox: {
#       startVersion: 4,
#       endVersion: 55
#     },
#     chrome: {
#       startVersion: 31,
#       endVersion: 60
#     },
#     safari: {
#       startVersion: 7,
#       endVersion: 7
#     }
#   },
#   'Mac 10.8': {
#     firefox: {
#       startVersion: 4,
#       endVersion: 48
#     },
#     chrome: {
#       startVersion: 27,
#       endVersion: 49
#     },
#     safari: {
#       startVersion: 6,
#       endVersion: 6
#     }
#   },
#   'Linux': {
#     firefox: {
#       startVersion: 4,
#       endVersion: 45
#     },
#     chrome: {
#       startVersion: 26,
#       endVersion: 48
#     },
#     opera: {
#       startVersion: 12,
#       endVersion: 12
#     }
#   }
# }

# /**
#  * each driver built here
#  * @param {Sting} os : 'Windows 10', 'Windows 8.1', 'Linux', 'Mac 10.12'
#  * @param {Sring} browser : 'firefox', 'chrome'...
#  * @param {int} version : browser version number
#  *
#  * @return {Object} : driver object
#  */
# function buildDriver(os, browser, version, test_info) {
#   var driver = new webdriver.Builder()
#     .withCapabilities({
#       'browserName': browser,
#       'name': test_info + os + " | " + browser + " | " + version,
#       'platform': os,
#       'version': version,
#     })
#     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
#     .build();
#   driver.getSession()
#     .then(function (sessionid) {
#       driver.sessionID = sessionid.id_;
#     });
#   return driver;
# }

# /**
#  * Execute tests here
#  * Write functions for each test here and call them in the section at the bottom of the page
#  */

# async function popups_display_and_close(title, driver, os, browser, version, testNum) {
#   test(title + ' - ' + os + ' | ' + browser + ' | ' + version + ')', async t => {
#     var passedBool = true;
#     try {
#       driver.manage()
#         .window()
#         .setSize(1366, 768);

#       // road building set here to stop victory point cards interfering with the test.
#       await driver.get(
#         'http://capstone-settlers.herokuapp.com/?startWithCards=3&setup=skip&fixedDice=true&dev_card=road_building'
#       );
#       await driver.findElement(webdriver.By.id('play')).click();
#       await driver.findElement(webdriver.By.id('player-input')).sendKeys(os + "|" + browser + "|" + version);
#       await driver.findElement(webdriver.By.id('start-game')).click();
      
#       if(testNum % 2 === 0){
#         await driver.wait(webdriver.until.elementLocated(webdriver.By.id('start-2-players')),20000);
#         await driver.findElement(webdriver.By.id('start-2-players')).click();
#         //player 1 sets up game and waits for player 2 to join
#         console.log(testNum + " :: " + "waiting...");
#       }else{
#         //wait until game_title visible
        
#         console.log(testNum + " :: " + "find game title...");
#         await driver.wait(webdriver.until.elementLocated(webdriver.By.className('game_list_row_title')),20000);
#         console.log(testNum + " :: " + "... game_list_row_title found...");
#         await driver.findElement(webdriver.By.id('game_id_0')).click();
#         console.log(testNum + " :: " + "... joined game ...");
#         //await driver.findElement(webdriver.By.className('game_list_row')).click();
#       }
#       console.log("exited if-else ...");
#       if( testNum % 2 === 0 ){
#         await driver.wait(webdriver.until.elementLocated(webdriver.By.id('begin-round')),20000);
#         console.log(testNum + " :: " + "... begin-round found ...");
#         await driver.findElement(webdriver.By.id('begin-round')).click();
#         console.log(testNum + " :: " + "... begin-round clicked ...");
        
#         await driver.wait(webdriver.until.elementLocated(webdriver.By.id('begin-round-btn')),20000);
#         console.log(testNum + " :: " + "... begin-round-btn found ...");
#         await driver.findElement(webdriver.By.id('begin-round-btn')).click();
#         console.log(testNum + " :: " + "... begin-round-btn clicked ...");
#       }
#       await driver.wait(webdriver.until.elementLocated(webdriver.By.id('begin-round')),20000);
#       console.log(testNum + " :: " + "... begin-round found ...");
#       await driver.findElement(webdriver.By.id('begin-round')).click();
#       console.log(testNum + " :: " + "... begin-round clicked ...");

#       await driver.wait(webdriver.until.elementLocated(webdriver.By.id('begin-round-btn')),20000);
#       console.log(testNum + " :: " + "... begin-round-btn found ...");
#       await driver.findElement(webdriver.By.id('begin-round-btn')).click();
#       console.log(testNum + " :: " + "... begin-round-btn clicked ...");

#       //get initial values to test against (they will be different based on resources distributed)
#       var startOre = await driver.findElement(webdriver.By.className('orecount'))
#         .getText();
#       var startSheep = await driver.findElement(webdriver.By.className('sheepcount'))
#         .getText();
#       var startGrain = await driver.findElement(webdriver.By.className('graincount'))
#         .getText();
      
#       console.log(testNum + " :: " + "... set variables with initial cards ...");
#       // click "Buy Development Card" button
#       await driver.findElement(webdriver.By.className('buybutton')).click();

#       // get returned values
#       var finishOre = await driver.findElement(webdriver.By.className('orecount'))
#         .getText();
#       var finishSheep = await driver.findElement(webdriver.By.className('sheepcount'))
#         .getText();
#       var finishGrain = await driver.findElement(webdriver.By.className('graincount'))
#         .getText();

#       // test cards removed when Buy Dev Card clicked
#       t.is(parseInt(finishSheep), parseInt(startSheep)-1);
#       t.is(parseInt(finishGrain), parseInt(startGrain)-1);
#       t.is(parseInt(finishOre), parseInt(startOre)-1);

#       console.log(testNum + " :: " + "... resource cards were removed ...");

#       // check card returned
#       t.is(await driver.findElement(webdriver.By.className('cardlist'))
#         .findElements(webdriver.By.className('card'))
#         .then(function (elements) {
#           return elements.length;
#         }), 1);

#       console.log(testNum + " :: " + "... development card returned ...");

#       // check in game popup works
#       await driver.wait(webdriver.until.elementLocated(webdriver.By.className('road_building')),20000);
#       await driver.findElement(webdriver.By.className('road_building'))
#         .click();
#       t.is(await driver.findElement(webdriver.By.className('popup_title'))
#         .getText(), "Catan Ministry of the Interior");

#       console.log(testNum + " :: " + "... tried playing a fresh development card ...");

#       // check can we close the popup window
#       await driver.findElement(webdriver.By.className('btn-right'))
#         .click();
#       //t.is(await driver.findElement(webdriver.By.className('popup')).getCSSvalue('display'), 'none');

#       console.log(testNum + " :: " + "... closed info popup ...");

#       saucelabs.updateJob(driver.sessionID, {
#         name: title + " | " + os + " | " + browser + " | " + version,
#         passed: passedBool,
#       });

#       driver.quit();

#     } catch (err) {
#       console.log(testNum + " :: " + "FAILED " + title + " - " + os + " | " + browser + " | " + version);
#       passedBool = false;
#       saucelabs.updateJob(driver.sessionID, {
#         name: title + " | " + os + " | " + browser + " | " + version,
#         passed: passedBool,
#       });

#       driver.quit();
#     }
#   });
# }

# /**
#  * Call tests here
#  */

# var testCapabilities = superQuickTests;

# // add descriptive string here and the test to the if-else statements below
# var testTitles = ['Popups display and close'];
# var testsRun = 0;
# // Loop through test names
# for (var j = 0; j < testTitles.length; j++) {

#   // Loop each Operating System
#   for (var os in testCapabilities) {

#     //Loop through each Browser on that Operating System
#     for (var browser in testCapabilities[os]) {

#       // Loop through each version specified for that Browser
#       for (var version = parseInt(testCapabilities[os][browser].startVersion); version <= parseInt(
#           testCapabilities[os][browser].endVersion); version++) {

#         //Find the correct test
#         if (testTitles[j] === 'Popups display and close') {

#           // initialise driver inside for loop otherwise can be created too early and time out
#           var driver = buildDriver(os + "", browser + "", version + "", testTitles[j] + " - ");
#           popups_display_and_close(testTitles[j], driver, os, browser, version, testsRun);
#           testsRun++;
#         }
#       }
#     }
#   }
# }

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

def popups(desired_cap, os, browser, version, testNum):
    try:
        print "set driver"
        driver = get_desired_cap(desired_cap)
        # wait=WebDriverWait(driver,10)

        # load website
        print "load website"
        driver.get("http://capstone-settlers.herokuapp.com/?startWithCards=3&setup=skip&fixedDice=true&dev_card=road_building")
        # driver.implicitly_wait(10)
        # click play button
        print "click play button"

        play = driver.find_element_by_id('play')
        play.click()

        print "add name"
        # add name to input
        playerInput = driver.find_element_by_id('player-input')
        playerInput.send_keys(os + "|" + browser + "|" + version))

        # click
        print "click player button"
        start_game = driver.find_elements_by_class_name('start-game')
        start_game[0].click()
        print "click game start"

        print "find correct player actions"
        # find the correct player actions
        player =  driver.find_elements_by_class_name('player')
        playerID = player[0].find_elements_by_tag_name('img')


         // road building set here to stop victory point cards interfering with the test.
#       await driver.get(
#         'http://capstone-settlers.herokuapp.com/?startWithCards=3&setup=skip&fixedDice=true&dev_card=road_building'
#       );
#       await driver.findElement(webdriver.By.id('play')).click();
#       await driver.findElement(webdriver.By.id('player-input')).sendKeys(os + "|" + browser + "|" + version);
#       await driver.findElement(webdriver.By.id('start-game')).click();
      
        if(testNum % 2 === 0)
#         await driver.wait(webdriver.until.elementLocated(webdriver.By.id('start-2-players')),20000);
          play = driver.find_element_by_id('start-2-players')
          play.click()
#         await driver.findElement(webdriver.By.id('start-2-players')).click();
#         //player 1 sets up game and waits for player 2 to join
#         console.log(testNum + " :: " + "waiting...");
#       }else{
#         //wait until game_title visible
        
#         console.log(testNum + " :: " + "find game title...");
#         await driver.wait(webdriver.until.elementLocated(webdriver.By.className('game_list_row_title')),20000);
#         console.log(testNum + " :: " + "... game_list_row_title found...");
#         await driver.findElement(webdriver.By.id('game_id_0')).click();
#         console.log(testNum + " :: " + "... joined game ...");
#         //await driver.findElement(webdriver.By.className('game_list_row')).click();
#       }
#       console.log("exited if-else ...");
#       if( testNum % 2 === 0 ){
#         await driver.wait(webdriver.until.elementLocated(webdriver.By.id('begin-round')),20000);
#         console.log(testNum + " :: " + "... begin-round found ...");
#         await driver.findElement(webdriver.By.id('begin-round')).click();
#         console.log(testNum + " :: " + "... begin-round clicked ...");
        
#         await driver.wait(webdriver.until.elementLocated(webdriver.By.id('begin-round-btn')),20000);
#         console.log(testNum + " :: " + "... begin-round-btn found ...");
#         await driver.findElement(webdriver.By.id('begin-round-btn')).click();
#         console.log(testNum + " :: " + "... begin-round-btn clicked ...");
#       }
#       await driver.wait(webdriver.until.elementLocated(webdriver.By.id('begin-round')),20000);
#       console.log(testNum + " :: " + "... begin-round found ...");
#       await driver.findElement(webdriver.By.id('begin-round')).click();
#       console.log(testNum + " :: " + "... begin-round clicked ...");

#       await driver.wait(webdriver.until.elementLocated(webdriver.By.id('begin-round-btn')),20000);
#       console.log(testNum + " :: " + "... begin-round-btn found ...");
#       await driver.findElement(webdriver.By.id('begin-round-btn')).click();
#       console.log(testNum + " :: " + "... begin-round-btn clicked ...");

#       //get initial values to test against (they will be different based on resources distributed)
#       var startOre = await driver.findElement(webdriver.By.className('orecount'))
#         .getText();
#       var startSheep = await driver.findElement(webdriver.By.className('sheepcount'))
#         .getText();
#       var startGrain = await driver.findElement(webdriver.By.className('graincount'))
#         .getText();
      
#       console.log(testNum + " :: " + "... set variables with initial cards ...");
#       // click "Buy Development Card" button
#       await driver.findElement(webdriver.By.className('buybutton')).click();

#       // get returned values
#       var finishOre = await driver.findElement(webdriver.By.className('orecount'))
#         .getText();
#       var finishSheep = await driver.findElement(webdriver.By.className('sheepcount'))
#         .getText();
#       var finishGrain = await driver.findElement(webdriver.By.className('graincount'))
#         .getText();

#       // test cards removed when Buy Dev Card clicked
#       t.is(parseInt(finishSheep), parseInt(startSheep)-1);
#       t.is(parseInt(finishGrain), parseInt(startGrain)-1);
#       t.is(parseInt(finishOre), parseInt(startOre)-1);

#       console.log(testNum + " :: " + "... resource cards were removed ...");

#       // check card returned
#       t.is(await driver.findElement(webdriver.By.className('cardlist'))
#         .findElements(webdriver.By.className('card'))
#         .then(function (elements) {
#           return elements.length;
#         }), 1);

#       console.log(testNum + " :: " + "... development card returned ...");

#       // check in game popup works
#       await driver.wait(webdriver.until.elementLocated(webdriver.By.className('road_building')),20000);
#       await driver.findElement(webdriver.By.className('road_building'))
#         .click();
#       t.is(await driver.findElement(webdriver.By.className('popup_title'))
#         .getText(), "Catan Ministry of the Interior");

#       console.log(testNum + " :: " + "... tried playing a fresh development card ...");

#       // check can we close the popup window
#       await driver.findElement(webdriver.By.className('btn-right'))
#         .click();
#       //t.is(await driver.findElement(webdriver.By.className('popup')).getCSSvalue('display'), 'none');




        print "finish round"
        #finish the round
        finish_round = driver.find_elements_by_class_name('finishturnbutton')
        finish_round[0].click()
        print "send to finish_testing"
        finish_testing(True, driver)
    except:
        finish_testing(False, driver)

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