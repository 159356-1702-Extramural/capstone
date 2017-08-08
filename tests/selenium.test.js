/**
 * 
 * Selenium testing using Saucelabs
 * https://www.saucelabs.com
 * 
 * Basic automated tests to ensure functionality across all platforms
 * (Create gameplay tests for all browsers and platforms)
 * 
 */

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

/**
 * Create browser / platforms to test against here
 */
// var driver_fx_xp = new webdriver.Builder()
//   .withCapabilities({
//     'browserName':'firefox',
//     'platform':'Windows XP',
//     'version': '42.0',})
//   .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//   .build();

// var driver_fx_7 = new webdriver.Builder()
//   .withCapabilities({
//     'browserName':'firefox',
//     'platform':'Windows 7',
//     'version': '46.0',})
//   .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//   .build();

// var driver_fx_8 = new webdriver.Builder()
//   .withCapabilities({
//     'browserName':'firefox',
//     'platform':'Windows 8',
//     'version': '50.0',})
//   .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//   .build();

var driver_fx_10 = new webdriver.Builder()
  .withCapabilities({
    'browserName':'firefox',
    'platform':'Windows 10',
    'version': '54.0',})
  .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
  .build();

var driver_fx_Mac = new webdriver.Builder()
  .withCapabilities({
    'browserName':'firefox',
    'platform':'Mac 10.12',
    'version': '54.0',})
  .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
  .build();

var driver_fx_Linux = new webdriver.Builder()
  .withCapabilities({
    'browserName':'firefox',
    'platform':'Linux',
    'version': '45.0',})
  .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
  .build();

// var driver_chr_xp = new webdriver.Builder()
//   .withCapabilities({
//     'browserName':'chrome',
//     'platform':'Windows XP',
//     'version': '45.0',})
//   .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//   .build();

//   var driver_chr_7 = new webdriver.Builder()
//   .withCapabilities({
//     'browserName':'chrome',
//     'platform':'Windows 7',
//     'version': '50.0',})
//   .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//   .build();

// var driver_chr_8 = new webdriver.Builder()
//   .withCapabilities({
//     'browserName':'chrome',
//     'platform':'Windows 8',
//     'version': '55.0',})
//   .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//   .build();

var driver_chr_10 = new webdriver.Builder()
  .withCapabilities({
    'browserName':'chrome',
    'platform':'Windows 10',
    'version': '60.0',})
  .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
  .build();

// var driver_chr_Mac = new webdriver.Builder()
//   .withCapabilities({
//     'browserName':'chrome',
//     'platform':'Mac 10.12',
//     'version': '56.0',})
//   .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//   .build();

// var driver_chr_Linux = new webdriver.Builder()
//   .withCapabilities({
//     'browserName':'chrome',
//     'platform':'Linux',
//     'version': '48.0',})
//   .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//   .build();

// var driver_sf_7 = new webdriver.Builder()
//   .withCapabilities({
//     'browserName':'safari',
//     'platform':'Windows 7',
//     'version': '5',})
//   .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//   .build();

// var driver_sf_Mac = new webdriver.Builder()
//   .withCapabilities({
//     'browserName':'safari',
//     'platform':'Mac 10.12',
//     'version': '10',})
//   .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//   .build();

// var driver_ie_xp = new webdriver.Builder()
//   .withCapabilities({
//     'browserName':'internet explorer',
//     'platform':'Windows XP',
//     'version': '8.0',})
//   .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//   .build();

// var driver_ie_7 = new webdriver.Builder()
//   .withCapabilities({
//     'browserName':'internet explorer',
//     'platform':'Windows 7',
//     'version': '9.0',})
//   .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//   .build();

// var driver_ie_8 = new webdriver.Builder()
//   .withCapabilities({
//     'browserName':'internet explorer',
//     'platform':'Windows 8',
//     'version': '10',})
//   .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//   .build();

var driver_ie_10 = new webdriver.Builder()
  .withCapabilities({
    'browserName':'internet explorer',
    'platform':'Windows 10',
    'version': '11',})
  .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
  .build();

/**
 * Hold all drivers in an array.
 * Any new tests can use the array as a parameter
 * See below for example
 */

var driversQuickTest = [driver_fx_Linux,driver_fx_Mac,driver_fx_10, driver_chr_10, driver_ie_10];
//var driversComprehensive = [driver_chr_xp, driver_chr_7, driver_chr_8, driver_chr_10, driver_chr_Linux, driver_chr_Mac,
//                 driver_fx_xp, driver_fx_7, driver_fx_8, driver_fx_10, driver_fx_Linux, driver_fx_Mac,
//                 driver_ie_xp, driver_ie_7, driver_ie_8, driver_ie_10,
//                 driver_sf_7, driver_sf_Mac];

var drivers = driversQuickTest;
/**
 * Execute tests here
 * Write functions for each test here and call them in the section below
 */

function frontPageLoads(browserDriver){
  test('Front game page exists', async t => {
    let driver = browserDriver;
    await driver.get('http://capstone-settlers.herokuapp.com/');
    t.is(await driver.getTitle(), "Settlers of Massey");
    await driver.quit();
});
}



/**
 * Call tests here
 */
for(var i = 0; i < drivers.length; i++){
  frontPageLoads(drivers[i]);
}

test.todo('Test add a player');



