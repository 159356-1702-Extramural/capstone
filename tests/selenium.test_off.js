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

 //Super quick tests
 var superQuickTests = {
    'Windows 10' : {
        'firefox' : {
            startVersion : 55,
            endVersion : 55
        },
        'MicrosoftEdge' : { //testing two versions here
            startVersion: 14,
            endVersion: 14
        }
    }
 }

 // Quick tests hold multiple of 4 tests at any time for testing in parallel
 var quickTests = {
    'Windows 10' : {
        'firefox' : {
            startVersion : 55,
            endVersion : 55
        },
        'chrome' : {
            startVersion : 60,
            endVersion : 60
        },
        'internet explorer' : {
            startVersion : 11,
            endVersion : 11
        },
        'MicrosoftEdge' : { //testing two versions here
            startVersion: 14,
            endVersion: 15
        },
    },
    'Windows 8.1' : {
        'firefox' : {
            startVersion : 55,
            endVersion : 55
        },
        'internet explorer' : {
            startVersion : 11,
            endVersion : 11
        }
    },
    'Linux': {
        'firefox' : {
            startVersion : 45,
            endVersion : 45
        },
        'chrome' : {
            startVersion : 48,
            endVersion : 48
        }
    },
    'Mac 10.12' : {
        'firefox' : {
            startVersion : 45,
            endVersion : 45
        },
        'chrome' : {
            startVersion : 60,
            endVersion : 60
        },
        'safari' : {
            startVersion : 10,
            endVersion : 10
        }
    }
 }

 var comprehensiveTests = {
    'Windows 10' : {
        'firefox' : {
            startVersion : 4,
            endVersion : 55
        },
        'chrome' : {
            startVersion : 26,
            endVersion : 60
        },
        'ie' : {
            startVersion : 11,
            endVersion : 11
        },
        'edge' : {
            startVersion: 13,
            endVersion: 15
        }
    },
    'Windows 8.1' : {
        firefox : {
            startVersion : 4,
            endVersion : 55
        },
        chrome : {
            startVersion : 26,
            endVersion : 60
        },
        ie : {
            startVersion : 11,
            endVersion : 11
        }
    },
    'Windows 8' : {
        firefox : {
            startVersion : 4,
            endVersion : 55
        },
        chrome : {
            startVersion : 26,
            endVersion : 60
        },
        ie : {
            startVersion : 10,
            endVersion : 10
        }
    },
    'Windows 7' : {
        firefox : {
            startVersion : 4,
            endVersion : 55
        },
        chrome : {
            startVersion : 26,
            endVersion : 60
        },
        ie : {
            startVersion : 8,
            endVersion : 11
        },
        opera : {
            startVersion : 11,
            endVersion : 12
        },
        safari : {
            startVersion : 5,
            endVersion : 5
        }
    },
    'Windows XP' : {
        firefox : {
            startVersion : 4,
            endVersion : 45
        },
        chrome : {
            startVersion : 26,
            endVersion : 49
        },
        ie : {
            startVersion : 6,
            endVersion : 8
        },
        opera : {
            startVersion : 11,
            endVersion : 12
        }
    },
    'Mac 10.12' : {
        firefox : {
            startVersion : 4,
            endVersion : 45
        },
        chrome : {
            startVersion : 27,
            endVersion : 60
        },
        safari : {
            startVersion : 10,
            endVersion : 10
        }
    },
    'Mac 10.11' : {
        firefox : {
            startVersion : 4,
            endVersion : 45
        },
        chrome : {
            startVersion : 27,
            endVersion : 60
        },
        safari : {
            startVersion : 9,
            endVersion : 10
        }
    },
    'Mac 10.10' : {
        chrome : {
            startVersion : 37,
            endVersion : 60
        },
        safari : {
            startVersion : 8,
            endVersion : 8
        }
    },
    'Mac 10.9' : {
        firefox : {
            startVersion : 4,
            endVersion : 55
        },
        chrome : {
            startVersion : 31,
            endVersion : 60
        },
        safari : {
            startVersion : 7,
            endVersion : 7
        }
    },
    'Mac 10.8' : {
        firefox : {
            startVersion : 4,
            endVersion : 48
        },
        chrome : {
            startVersion : 27,
            endVersion : 49
        },
        safari : {
            startVersion : 6,
            endVersion : 6
        }
    },
    'Linux' : {
        firefox : {
            startVersion : 4,
            endVersion : 45
        },
        chrome : {
            startVersion : 26,
            endVersion : 48
        },
        opera : {
            startVersion : 12,
            endVersion : 12
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
function buildDriver(os, browser, version) {
    var driver = new webdriver.Builder()
        .withCapabilities({
            'browserName':browser,
            'platform':os,
            'version': version,})
        .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
        .build();
    driver.getSession().then(function (sessionid){
        driver.sessionID = sessionid.id_;
    });
    return driver;
}

/**
 * Execute tests here
 * Write functions for each test here and call them in the section below
 */

function frontPageLoads(browserDriver, os, browser, version){
  test('Front game page exists - '+os+' | '+browser+' | '+ version+')', async t => {
      let driver = browserDriver;
      await driver.get('http://capstone-settlers.herokuapp.com/');
      t.is(await driver.getTitle(), "Settlers of Massey");
      await driver.quit();
  });
}
function setupSequence(browserDriver, os, browser, version){
    test('Setup through to game start - '+os+' | '+browser+' | '+ version+')', async t => {

      let driver = browserDriver;
      t.truthy(await runSetup(driver, os+"|"+browser));
      
      saucelabs.updateJob(driver.sessionID, {
        name: title,
        passed: passed
      }, done);
    });
}

async function runSetup(driver, keyword) {
    driver.manage().window().setSize(1024, 768);
    await driver.get('http://capstone-settlers.herokuapp.com/');
    await driver.findElement(webdriver.By.id('play')).click();
    await driver.findElement(webdriver.By.id('txt_player1')).sendKeys(keyword);
    await driver.findElement(webdriver.By.className('player_button')).click();

    // await driver.wait(webdriver.until.elementLocated(webdriver.By.id('get_started')),20000);
    // await driver.findElement(webdriver.By.id('get_started')).click();

    await driver.actions().mouseDown('settlement_purple_open_4').mouseMove('node_21').mouseUp().perform();
    await driver.wait(webdriver.until.titleIs("Settlers of Massey"), 10000);
    
}

async function buy_year_of_plenty(driver,os, browser, version) {
    test('Buy Year of Plenty using - '+os+' | '+browser+' | '+ version+')', async t => {
        driver.manage().window().setSize(1024, 768);
        await driver.get('http://capstone-settlers.herokuapp.com/?startWithCards=10&setup=skip&dev_card=year_of_plenty');
        await driver.findElement(webdriver.By.id('play')).click();
        await driver.findElement(webdriver.By.id('txt_player1')).sendKeys(os+"|"+browser+"|"+version);
        await driver.findElement(webdriver.By.className('player_button')).click();
        //below code twice to pass through two modals
        await driver.findElement(webdriver.By.className('btn-info')).click();
        await driver.findElement(webdriver.By.className('btn-info')).click();
        await driver.findElement(webdriver.By.className('buybutton')).click();
        await driver.findElement(webdriver.By.className('year_of_plenty')).click();
    });
}

async function buy_monopoly(driver,os, browser, version) {
    test('Buy Year of Plenty using - '+os+' | '+browser+' | '+ version+')', async t => {
        driver.manage().window().setSize(1024, 768);
        await driver.get('http://capstone-settlers.herokuapp.com/?startWithCards=10&setup=skip&dev_card=monopoly');
        await driver.findElement(webdriver.By.id('play')).click();
        await driver.findElement(webdriver.By.id('txt_player1')).sendKeys(os+"|"+browser+"|"+version);
        await driver.findElement(webdriver.By.className('player_button')).click();
        //below code twice to pass through two modals
        await driver.findElement(webdriver.By.className('btn-info')).click();
        await driver.findElement(webdriver.By.className('btn-info')).click();
        await driver.findElement(webdriver.By.className('buybutton')).click();
        await driver.findElement(webdriver.By.className('finishturnbutton')).click();
        
        //test that the monopoly button is shown
        t.truthy(driver.findElements(webdriver.By.name('useMonopoly')).size() > 0);
    });
}
/**
 * Call tests here
 */

var testCapabilities = quickTests;

for(var os in testCapabilities){
    for(var browser in testCapabilities[os]){
        for( var i = parseInt(testCapabilities[os][browser].startVersion); i <= parseInt(testCapabilities[os][browser].endVersion); i++){
            var driver = buildDriver(os+"",browser+"", i+"");
            buy_monopoly(driver, os, browser, i);
        }
    }
}


