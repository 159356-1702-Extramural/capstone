/**
 *
 * Selenium testing using Saucelabs
 * https://www.saucelabs.com
 *
 * Basic automated tests to ensure functionality across all platforms
 * (Create gameplay tests for all browsers and platforms)
 *
 * Selenium tests currently setup for quick testing of major browsers and Desktop OS's
 *
 */
var comprehensiveTest = false;

var assert = require('assert');
var SauceLabs = require("saucelabs");
var username = "sumnerfit";
var accessKey = "e8a11001-6685-43c4-901b-042e862a93f4";
var saucelabs = new SauceLabs({
  username: username,
  password: accessKey
});

var test = require('ava');
var webdriver = require('selenium-webdriver');
var drivers = [];

webdriver.promise.USE_PROMISE_MANAGER = false;
/**
 * Create browser / platforms to test against here
 * function formated driver_browser_os
 *    i.e. driver_fx_xp = Firefox on Windows XP
 * Note: version number coresponds to browser version number
 *
 * TODO: break down functions below to one function with an input array of platform/browers/version
 *
 * https://saucelabs.com/platforms
 *
 */

//Super quick tests for setting up tests and not over loading saucelabs
var superQuickTests = {
  'Windows 10': {
    'firefox': {
      startVersion: 54,
      endVersion: 55
    },
  }
}

// Quick tests hold multiple of 4 tests at any time for testing in parallel - currently 8 combos
var quickTests = {
  'Windows 10': {
    'firefox': {
      startVersion: 55,
      endVersion: 55
    },
    'chrome': {
      startVersion: 60,
      endVersion: 60
    },
    'internet explorer': {
      startVersion: 11,
      endVersion: 11
    },
    'MicrosoftEdge': { //testing two versions here
      startVersion: 14,
      endVersion: 15
    },
  },
  'Windows 8.1': {
    'firefox': {
      startVersion: 55,
      endVersion: 55
    },
    'internet explorer': {
      startVersion: 11,
      endVersion: 11
    }
  },
  'Linux': {
    'firefox': {
      startVersion: 45,
      endVersion: 45
    },
    'chrome': {
      startVersion: 48,
      endVersion: 48
    }
  },
  'Mac 10.12': {
    'firefox': {
      startVersion: 45,
      endVersion: 45
    },
    'chrome': {
      startVersion: 60,
      endVersion: 60
    },
    'safari': {
      startVersion: 10,
      endVersion: 10
    }
  }
}

var comprehensiveTests = {
  'Windows 10': {
    'firefox': {
      startVersion: 4,
      endVersion: 55
    },
    'chrome': {
      startVersion: 26,
      endVersion: 60
    },
    'ie': {
      startVersion: 11,
      endVersion: 11
    },
    'edge': {
      startVersion: 13,
      endVersion: 15
    }
  },
  'Windows 8.1': {
    firefox: {
      startVersion: 4,
      endVersion: 55
    },
    chrome: {
      startVersion: 26,
      endVersion: 60
    },
    ie: {
      startVersion: 11,
      endVersion: 11
    }
  },
  'Windows 8': {
    firefox: {
      startVersion: 4,
      endVersion: 55
    },
    chrome: {
      startVersion: 26,
      endVersion: 60
    },
    ie: {
      startVersion: 10,
      endVersion: 10
    }
  },
  'Windows 7': {
    firefox: {
      startVersion: 4,
      endVersion: 55
    },
    chrome: {
      startVersion: 26,
      endVersion: 60
    },
    ie: {
      startVersion: 8,
      endVersion: 11
    },
    opera: {
      startVersion: 11,
      endVersion: 12
    },
    safari: {
      startVersion: 5,
      endVersion: 5
    }
  },
  'Windows XP': {
    firefox: {
      startVersion: 4,
      endVersion: 45
    },
    chrome: {
      startVersion: 26,
      endVersion: 49
    },
    ie: {
      startVersion: 6,
      endVersion: 8
    },
    opera: {
      startVersion: 11,
      endVersion: 12
    }
  },
  'Mac 10.12': {
    firefox: {
      startVersion: 4,
      endVersion: 45
    },
    chrome: {
      startVersion: 27,
      endVersion: 60
    },
    safari: {
      startVersion: 10,
      endVersion: 10
    }
  },
  'Mac 10.11': {
    firefox: {
      startVersion: 4,
      endVersion: 45
    },
    chrome: {
      startVersion: 27,
      endVersion: 60
    },
    safari: {
      startVersion: 9,
      endVersion: 10
    }
  },
  'Mac 10.10': {
    chrome: {
      startVersion: 37,
      endVersion: 60
    },
    safari: {
      startVersion: 8,
      endVersion: 8
    }
  },
  'Mac 10.9': {
    firefox: {
      startVersion: 4,
      endVersion: 55
    },
    chrome: {
      startVersion: 31,
      endVersion: 60
    },
    safari: {
      startVersion: 7,
      endVersion: 7
    }
  },
  'Mac 10.8': {
    firefox: {
      startVersion: 4,
      endVersion: 48
    },
    chrome: {
      startVersion: 27,
      endVersion: 49
    },
    safari: {
      startVersion: 6,
      endVersion: 6
    }
  },
  'Linux': {
    firefox: {
      startVersion: 4,
      endVersion: 45
    },
    chrome: {
      startVersion: 26,
      endVersion: 48
    },
    opera: {
      startVersion: 12,
      endVersion: 12
    }
  }
}

/**
 * each driver built here
 * @param {Sting} os : 'Windows 10', 'Windows 8.1', 'Linux', 'Mac 10.12'
 * @param {Sring} browser : 'firefox', 'chrome'...
 * @param {int} version : browser version number
 *
 * @return {Object} : driver object
 */
function buildDriver(os, browser, version, test_info) {
  var driver = new webdriver.Builder()
    .withCapabilities({
      'browserName': browser,
      'name': test_info + os + " | " + browser + " | " + version,
      'platform': os,
      'version': version,
    })
    .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
    .build();
  driver.getSession()
    .then(function (sessionid) {
      driver.sessionID = sessionid.id_;
    });
  return driver;
}

/**
 * Execute tests here
 * Write functions for each test here and call them in the section at the bottom of the page
 */

async function popups_display_and_close(title, driver, os, browser, version, testNum) {
  test(title + ' - ' + os + ' | ' + browser + ' | ' + version + ')', async t => {
    var passedBool = true;
    try {
      driver.manage()
        .window()
        .setSize(1366, 768);

      // road building set here to stop victory point cards interfering with the test.
      await driver.get(
        'http://capstone-settlers.herokuapp.com/?startWithCards=3&setup=skip&fixedDice=true&dev_card=road_building'
      );  
      await driver.findElement(webdriver.By.id('play')).click();
      await driver.findElement(webdriver.By.id('player-input')).sendKeys(os + "|" + browser + "|" + version);
      await driver.findElement(webdriver.By.id('start-game')).click();
      
      if(testNum % 2 === 0){
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('start-2-players')),20000);
        await driver.findElement(webdriver.By.id('start-2-players')).click();
        //player 1 sets up game and waits for player 2 to join
        console.log(testNum + " :: " + "waiting...");
      }else{
        //wait until game_title visible
        
        console.log(testNum + " :: " + "find game title...");
        await driver.wait(webdriver.until.elementLocated(webdriver.By.className('game_list_row_title')),20000);
        console.log(testNum + " :: " + "... game_list_row_title found...");
        await driver.findElement(webdriver.By.id('game_id_0')).click();
        console.log(testNum + " :: " + "... joined game ...");
        //await driver.findElement(webdriver.By.className('game_list_row')).click();
      }
      console.log("exited if-else ...");
      if( testNum % 2 === 0 ){
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('begin-round')),20000);
        console.log(testNum + " :: " + "... begin-round found ...");
        await driver.findElement(webdriver.By.id('begin-round')).click();
        console.log(testNum + " :: " + "... begin-round clicked ...");
        
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('begin-round-btn')),20000);
        console.log(testNum + " :: " + "... begin-round-btn found ...");
        await driver.findElement(webdriver.By.id('begin-round-btn')).click();
        console.log(testNum + " :: " + "... begin-round-btn clicked ...");
      }
      await driver.wait(webdriver.until.elementLocated(webdriver.By.id('begin-round')),20000);
      console.log(testNum + " :: " + "... begin-round found ...");
      await driver.findElement(webdriver.By.id('begin-round')).click();
      console.log(testNum + " :: " + "... begin-round clicked ...");

      await driver.wait(webdriver.until.elementLocated(webdriver.By.id('begin-round-btn')),20000);
      console.log(testNum + " :: " + "... begin-round-btn found ...");
      await driver.findElement(webdriver.By.id('begin-round-btn')).click();
      console.log(testNum + " :: " + "... begin-round-btn clicked ...");

      //get initial values to test against (they will be different based on resources distributed)
      var startOre = await driver.findElement(webdriver.By.className('orecount'))
        .getText();
      var startSheep = await driver.findElement(webdriver.By.className('sheepcount'))
        .getText();
      var startGrain = await driver.findElement(webdriver.By.className('graincount'))
        .getText();
      
      console.log(testNum + " :: " + "... set variables with initial cards ...");
      // click "Buy Development Card" button
      await driver.findElement(webdriver.By.className('buybutton')).click();

      // get returned values
      var finishOre = await driver.findElement(webdriver.By.className('orecount'))
        .getText();
      var finishSheep = await driver.findElement(webdriver.By.className('sheepcount'))
        .getText();
      var finishGrain = await driver.findElement(webdriver.By.className('graincount'))
        .getText();

      // test cards removed when Buy Dev Card clicked
      t.is(parseInt(finishSheep), parseInt(startSheep)-1);
      t.is(parseInt(finishGrain), parseInt(startGrain)-1);
      t.is(parseInt(finishOre), parseInt(startOre)-1);

      console.log(testNum + " :: " + "... resource cards were removed ...");

      // check card returned
      t.is(await driver.findElement(webdriver.By.className('cardlist'))
        .findElements(webdriver.By.className('card'))
        .then(function (elements) {
          return elements.length;
        }), 1);

      console.log(testNum + " :: " + "... development card returned ...");

      // check in game popup works
      await driver.wait(webdriver.until.elementLocated(webdriver.By.className('road_building')),20000);
      await driver.findElement(webdriver.By.className('road_building'))
        .click();
      t.is(await driver.findElement(webdriver.By.className('popup_title'))
        .getText(), "Catan Ministry of the Interior");

      console.log(testNum + " :: " + "... tried playing a fresh development card ...");

      // check can we close the popup window
      await driver.findElement(webdriver.By.className('btn-right'))
        .click();
      //t.is(await driver.findElement(webdriver.By.className('popup')).getCSSvalue('display'), 'none');

      console.log(testNum + " :: " + "... closed info popup ...");

      saucelabs.updateJob(driver.sessionID, {
        name: title + " | " + os + " | " + browser + " | " + version,
        passed: passedBool,
      });

      driver.quit();

    } catch (err) {
      console.log(testNum + " :: " + "FAILED " + title + " - " + os + " | " + browser + " | " + version);
      passedBool = false;
      saucelabs.updateJob(driver.sessionID, {
        name: title + " | " + os + " | " + browser + " | " + version,
        passed: passedBool,
      });

      driver.quit();
    }
  });
}

/**
 * Call tests here
 */

var testCapabilities = superQuickTests;

// add descriptive string here and the test to the if-else statements below
var testTitles = ['Popups display and close'];
var testsRun = 0;
// Loop through test names
for (var j = 0; j < testTitles.length; j++) {

  // Loop each Operating System
  for (var os in testCapabilities) {

    //Loop through each Browser on that Operating System
    for (var browser in testCapabilities[os]) {

      // Loop through each version specified for that Browser
      for (var version = parseInt(testCapabilities[os][browser].startVersion); version <= parseInt(
          testCapabilities[os][browser].endVersion); version++) {

        //Find the correct test
        if (testTitles[j] === 'Popups display and close') {

          // initialise driver inside for loop otherwise can be created too early and time out
          var driver = buildDriver(os + "", browser + "", version + "", testTitles[j] + " - ");
          popups_display_and_close(testTitles[j], driver, os, browser, version, testsRun);
          testsRun++;
        }
      }
    }
  }
}
