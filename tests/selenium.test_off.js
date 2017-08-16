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

/**
 * Create browser / platforms to test against here
 * function formated driver_browser_os
 *    i.e. driver_fx_xp = Firefox on Windows XP
 * Note: version number coresponds to browser version number 
 * 
 * TODO: break down functions below to one function with an input array of platform/browers/version
 */
var comprehensiveTestBrowsers=[
    ['firefox','Windows XP','42.0'],
    ['firefox','Windows 7','49.0'],
    ['firefox','Windows 8','50.0'],
    ['chrome','Windows XP','45.0'],
    ['chrome','Windows 7','50.0'],
    ['chrome','Windows 8','45.0'],
    ['chrome','Mac 10.12','56.0'],
    ['chrome','Linux','48.0'],
    ['safari','Mac 10.12','10'],
    ['internet explorer','Windows XP','8'],
    ['internet explorer','Windows 7','9'],
    ['internet explorer','Windows 8','10']

];
var quickTestBrowsers=[
    ['firefox','Windows 10','54.0'],
    ['firefox','Linux','45.0'],
    ['chrome','Windows 10','60.0'],
    ['internet explorer','Windows 10','11'],
    ['microsoftedge','Windows 10','15']
]
function buildPlatforms(browserName, platform, version) {
    var driver=new webdriver.Builder()
        .withCapabilities({
            'browserName':browserName,
            'platform':platform,
            'version': version})
        .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
        .build();
}

//  function comprehensivePlatforms(){
//     var driver_fx_xp = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'firefox',
//         'platform':'Windows XP',
//         'version': '42.0',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//     var driver_fx_7 = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'firefox',
//         'platform':'Windows 7',
//         'version': '49.0',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//     var driver_fx_8 = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'firefox',
//         'platform':'Windows 8',
//         'version': '50.0',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//       .build();
//
//     var driver_chr_xp = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'chrome',
//         'platform':'Windows XP',
//         'version': '45.0',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//     var driver_chr_7 = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'chrome',
//         'platform':'Windows 7',
//         'version': '50.0',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//     var driver_chr_8 = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'chrome',
//         'platform':'Windows 8',
//         'version': '55.0',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//     var driver_chr_Mac = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'chrome',
//         'platform':'Mac 10.12',
//         'version': '56.0',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//     var driver_chr_Linux = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'chrome',
//         'platform':'Linux',
//         'version': '48.0',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//     var driver_sf_7 = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'safari',
//         'platform':'Windows 7',
//         'version': '5',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//     var driver_sf_Mac = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'safari',
//         'platform':'Mac 10.12',
//         'version': '10',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//     var driver_ie_xp = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'internet explorer',
//         'platform':'Windows XP',
//         'version': '8.0',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//     var driver_ie_7 = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'internet explorer',
//         'platform':'Windows 7',
//         'version': '9.0',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//     var driver_ie_8 = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'internet explorer',
//         'platform':'Windows 8',
//         'version': '10',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//     return [driver_chr_xp, driver_chr_7, driver_chr_Linux, driver_chr_Mac,
//       driver_fx_xp, driver_fx_7, driver_fx_8,
//       driver_ie_xp, driver_ie_7, driver_ie_8,
//       driver_sf_7, driver_sf_Mac];
//
// }
// function quickPlatforms(){
//   var driver_fx_10 = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'firefox',
//         'platform':'Windows 10',
//         'version': '54.0',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//   var driver_fx_Mac = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'firefox',
//         'name': 'MacOS 10.12 - Firefox',
//         'platform':'Mac 10.12',
//         'version': '54.0',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//   var driver_fx_Linux = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'firefox',
//         'platform':'Linux',
//         'version': '45.0',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//   var driver_chr_10 = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'chrome',
//         'platform':'Windows 10',
//         'version': '60.0',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//   var driver_ie_10 = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'internet explorer',
//         'platform':'Windows 10',
//         'version': '11',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//   var driver_edge_10 = new webdriver.Builder()
//     .withCapabilities({
//         'browserName':'microsoftedge',
//         'platform':'Windows 10',
//         'version': '15',})
//     .usingServer('http://' + username + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
//     .build();
//
//     return [driver_fx_Linux,driver_fx_Mac,driver_fx_10, driver_chr_10, driver_ie_10, driver_edge_10];
// }

/**
 * Execute tests here
 * Write functions for each test here and call them in the section below
 */

function frontPageLoads(browserDriver){
  test('Front game page exists (todo:add browser/os here)', async t => {
      let driver = browserDriver;
      await driver.get('http://capstone-settlers.herokuapp.com/');
      t.is(await driver.getTitle(), "Settlers Of Massey");
      await driver.quit();
  });
}

/**
 * Drivers and platform/browser combos enabled here
 */

if(comprehensiveTest){
  //create drivers using both the quick tests and the outlier tests
    var allPlatforms=comprehensiveTestBrowsers.concat(quickTestBrowsers);
    for (var i=0;i<allPlatforms.length;i++){
        drivers.push(buildPlatforms(allPlatforms[i][0],allPlatforms[i][1],allPlatforms[i][2]))
    }
  // drivers = quickPlatforms().concat(comprehensivePlatforms());
}else{
  //drivers = quickPlatforms();
    for (var i=0;i<quickTestBrowsers.length;i++){
        drivers.push(buildPlatforms(quickTestBrowsers[i][0],quickTestBrowsers[i][1],quickTestBrowsers[i][2]));
    }
}

/**
 * Call tests here
 */

for(var i = 0; i < drivers.length; i++){
//  var concurrentDrivers = 0;
//  while(concurrentDrivers > 5){
//    saucelabs.getJobs(function(err,jobs){
//      concurrentDrivers = jobs.length;
//    })
//   }
 frontPageLoads(drivers[i]);
}

