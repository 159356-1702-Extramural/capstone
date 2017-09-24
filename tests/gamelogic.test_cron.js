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
function buildDriver(os, browser, version, test_info) {
    var driver = new webdriver.Builder()
        .withCapabilities({
            'browserName':browser,
            'name' : test_info + os + " | " + browser + " | " + version,
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
 * Write functions for each test here and call them in the section at the bottom of the page
 */

function frontPageLoads(browserDriver, os, browser, version){
  test('Front game page exists - '+os+' | '+browser+' | '+ version+')', async t => {
      let driver = browserDriver;
      await driver.get('http://capstone-settlers.herokuapp.com/');
      t.is(await driver.getTitle(), "Settlers of Massey");
      await driver.quit();
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

async function buy_monopoly(title, driver,os, browser, version) {
    test(title + ' - '+os+' | '+browser+' | '+ version+')', async t => {
        try{
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
            await driver.findElement(webdriver.By.xpath("//div[@class='popup_inner]"));
            await driver.findElement(webdriver.By.id('useMonopoly')).click();

            t.truthy(true);
        }
        catch (err) {
            console.log('FAILED: ' + title + '  - '+os+' | '+browser+' | '+ version);
            console.log(err);
        }
        finally {
            driver.quit();
        }
    });
}

async function trade4to1(title, driver,os, browser, version) {
    test(title + ' - '+os+' | '+browser+' | '+ version+')', async t => {
        try{
            driver.manage().window().setSize(1024, 768);
            await driver.get('http://capstone-settlers.herokuapp.com/?startWithCards=10&setup=skip&fixedDice=true');
            await driver.findElement(webdriver.By.id('play')).click();
            await driver.findElement(webdriver.By.id('txt_player1')).sendKeys(os+"|"+browser+"|"+version);
            await driver.findElement(webdriver.By.className('player_button')).click();
            //below code twice to pass through two modals
            driver.sleep(2000);
            await driver.findElement(webdriver.By.className('btn-info')).click();
            await driver.findElement(webdriver.By.className('btn-info')).click();
            driver.sleep(500)
            //get initial values to test against (they will be different based on resources distributed)
            var startGrain = await driver.findElement(webdriver.By.className('graincount')).getText();
            var startBrick = await driver.findElement(webdriver.By.className('brickcount')).getText();

            await driver.findElement(webdriver.By.className('tradebutton')).click();
            await driver.findElement(webdriver.By.xpath('//div[@data-resource="brick" and @class="card_give"]')).click();
            await driver.findElement(webdriver.By.xpath('//div[@data-resource="grain" and @class="card_receive"]')).click();
            await driver.findElement(webdriver.By.className('btn-info')).click();

            var finishGrain = await driver.findElement(webdriver.By.className('graincount')).getText();
            var finishBrick = await driver.findElement(webdriver.By.className('brickcount')).getText();

            //test that the monopoly button is shown
            t.is( parseInt(finishGrain) , parseInt(startGrain)+1);
            t.is( parseInt(finishBrick) , parseInt(startBrick)-4);

            await driver.findElement(webdriver.By.className('finishturnbutton')).click();
            // saucelabs.updateJob(driver.sessionID, {
            //     name: title,
            //     passed: true
            //     }, done);
        }
        catch(err){
            console.log('FAILED: Trade a card 4:1 - '+os+' | '+browser+' | '+ version);
            // saucelabs.updateJob(driver.sessionID, {
            //     name: title,
            //     passed: false,
            //     }, done);
        }
        finally{
            driver.quit();

        }
    });
}

async function buy_year_of_plenty(title, driver,os, browser, version) {
    test(title + ' - '+os+' | '+browser+' | '+ version+')', async t => {
        try{
            driver.manage().window().setSize(1024, 768);
            await driver.get('http://capstone-settlers.herokuapp.com/?startWithCards=10&setup=skip&fixedDice=true&dev_card=year_of_plenty');
            await driver.findElement(webdriver.By.id('play')).click();
            await driver.findElement(webdriver.By.id('txt_player1')).sendKeys(os+"|"+browser+"|"+version);
            await driver.findElement(webdriver.By.className('player_button')).click();
            //below code twice to pass through two modals
            driver.sleep(2000);
            await driver.findElement(webdriver.By.className('btn-info')).click();
            await driver.findElement(webdriver.By.className('btn-info')).click();
            driver.sleep(500)

            await driver.findElement(webdriver.By.className('buybutton')).click();

            //get initial values to test against (they will be different based on resources distributed)
            var startGrain = await driver.findElement(webdriver.By.className('graincount')).getText();
            var startBrick = await driver.findElement(webdriver.By.className('brickcount')).getText();

            await driver.findElement(webdriver.By.className('year_of_plenty')).click();
            await driver.findElement(webdriver.By.xpath('//div[@data-resource="brick" and @class="year_receive"]')).click();
            await driver.findElement(webdriver.By.xpath('//div[@data-resource="grain" and @class="year_receive"]')).click();
            await driver.findElement(webdriver.By.className('year_of_plenty_button')).click();

            //test that the monopoly button is shown
            t.is(await driver.findElement(webdriver.By.className('graincount')).getText(), ((parseInt(startGrain))+1)+"");
            t.is(await driver.findElement(webdriver.By.className('brickcount')).getText(), ((parseInt(startBrick))+1)+"");

            // saucelabs.updateJob(driver.sessionID, {
            //     name: title,
            //     passed: true
            //     }, done);
        }
        catch(err){
            console.log('FAILED: Trade a card 4:1 - '+os+' | '+browser+' | '+ version);
            // saucelabs.updateJob(driver.sessionID, {
            //     name: title,
            //     passed: false,
            //     }, done);
        }
        finally{
            driver.quit();

        }
    });
}
async function buy_road_building(title, driver,os, browser, version) {
    test(title + ' - '+os+' | '+browser+' | '+ version+')', async t => {
        try{
            driver.manage().window().setSize(1024, 768);
            await driver.get('http://capstone-settlers.herokuapp.com/?startWithCards=10&setup=skip&fixedDice=true&dev_card=road_building');
            await driver.findElement(webdriver.By.id('play')).click();
            await driver.findElement(webdriver.By.id('txt_player1')).sendKeys(os+"|"+browser+"|"+version);
            await driver.findElement(webdriver.By.className('player_button')).click();
            //below code twice to pass through two modals
            driver.sleep(2000);
            await driver.findElement(webdriver.By.className('btn-info')).click();
            driver.sleep(500)
            await driver.findElement(webdriver.By.className('btn-info')).click();
            driver.sleep(500)

            //get initial values to test against (they will be different based on resources distributed)
            var startLumber = await driver.findElement(webdriver.By.className('lumbercount')).getText();
            var startBrick = await driver.findElement(webdriver.By.className('brickcount')).getText();

            await driver.findElement(webdriver.By.className('buybutton')).click();

            await driver.findElement(webdriver.By.className('road_building')).click();
            await driver.findElement(webdriver.By.className('road_building_button')).click();

            //test that the monopoly button is shown
            t.is(await driver.findElement(webdriver.By.className('lumbercount')).getText(), ((parseInt(startLumber))+2)+"");
            t.is(await driver.findElement(webdriver.By.className('brickcount')).getText(), ((parseInt(startBrick))+2)+"");

            // saucelabs.updateJob(driver.sessionID, {
            //     name: title,
            //     passed: true
            //     }, done);
        }
        catch(err){
            console.log('FAILED: Trade a card 4:1 - '+os+' | '+browser+' | '+ version);
            // saucelabs.updateJob(driver.sessionID, {
            //     name: title,
            //     passed: false,
            //     }, done);
        }
        finally{
            driver.quit();

        }
    });
}

/**
 * Call tests here
 */

var testCapabilities = superQuickTests;

// add descriptive string here and the test to the if-else statements below
var testTitles = ['Start up and Setup complete','Popups display and close','Play Road Building', 'Purchase Monopoly', 'Trading 4:1', 'Play Year of Plenty'];

for(var j = 0; j < testTitles.length; j++){
    for(var os in testCapabilities){
        for(var browser in testCapabilities[os]){
            for( var version = parseInt(testCapabilities[os][browser].startVersion); version <= parseInt(testCapabilities[os][browser].endVersion); version++){

                if(testTitles[j] === 'Trading 4:1'){

                    // initialise driver inside for loop otherwise can be created too early and time out
                    var driver = buildDriver(os+"",browser+"", version+"", testTitles[j]+" - ");
                    trade4to1(testTitles[j], driver, os, browser, version);

                }else if(testTitles[j] === 'Purchase Monopoly'){

                    // initialise driver inside for loop otherwise can be created too early and time out
                    //var driver = buildDriver(os+"",browser+"", version+"", testTitles[j]+" - ");
                    //buy_monopoly(testTitles[j], driver, os, browser, version);

                }else if(testTitles[j] === 'Play Year of Plenty'){

                    // initialise driver inside for loop otherwise can be created too early and time out
                    //var driver = buildDriver(os+"",browser+"", version+"", testTitles[j]+" - ");
                    //buy_year_of_plenty(testTitles[j], driver, os,browser, version);

                }else if(testTitles[j] === 'Play Road Building'){

                    // initialise driver inside for loop otherwise can be created too early and time out
                    var driver = buildDriver(os+"",browser+"", version+"", testTitles[j]+" - ");
                    buy_road_building(testTitles[j], driver, os,browser, version);

                }else if(testTitles[j] === 'Play Road Building'){

                    // initialise driver inside for loop otherwise can be created too early and time out
                    //var driver = buildDriver(os+"",browser+"", version+"", testTitles[j]+" - ");
                    //buy_road_building(testTitles[j], driver, os,browser, version);
                }

            }
        }
    }
}

