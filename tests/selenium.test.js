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

test.beforeEach(t => {
  t.context.driver = new webdriver.Builder()
    .forBrowser('chrome')
    .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
    .build();
});

test.todo('Test add a player');

test('Front game page exists', async t => {
  let driver = t.context.driver;
  await driver.get('http://capstone-settlers.herokuapp.com/');
  t.is(await driver.getTitle(), "Settlers of Massey");
  await driver.quit();
});
