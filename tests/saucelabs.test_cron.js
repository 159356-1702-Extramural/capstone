import test from 'ava';
var webdriverio = require('webdriverio');

function popups_display_and_close(testTitle, driver, os, browser, version, testsRun){
    var client = webdriverio.remote({
        desiredCapabilities: {
            browserName: browser,
            version: version,
            platform: os,
            tags: ['examples'],
            name: testTitle,
            screenResolution: "1280x768",

            // If using Open Sauce (https://saucelabs.com/opensauce/),
            // capabilities must be tagged as "public" for the jobs's status
            // to update (failed/passed). If omitted on Open Sauce, the job's
            // status will only be marked "Finished." This property can be
            // be omitted for commerical (private) Sauce Labs accounts.
            // Also see https://support.saucelabs.com/customer/portal/articles/2005331-why-do-my-tests-say-%22finished%22-instead-of-%22passed%22-or-%22failed%22-how-do-i-set-the-status-
            'public': true
        },
        host: 'ondemand.saucelabs.com',
        port: 80,
        user: "sumnerfit",
        key: "e8a11001-6685-43c4-901b-042e862a93f4",
        logLevel: 'verbose'
    });

    test.before(async t => {
        await client.init()
            .url('http://capstone-settlers.herokuapp.com/?startWithCards=3&setup=skip&fixedDice=true&dev_card=road_building')
            .click('#play')
            .setValue('#player-input', 'Test Player')
            .click('#start-game');
        if(testsRun % 2 === 0){
          console.log(testsRun + " : moved into if statement");
          await client.click('#start-2-players');

        }else{
          console.log(testsRun + " : moved into else statement");
          await client.waitForVisible('#game_id_0',10000)
          .click('#game_id_0')
          .waitForVisible('#begin-round',10000)
          .click("#begin-round")
          .waitForVisible('#begin-round-btn',10000)
          .click("#begin-round-btn")
          .waitForVisible('.buybutton',10000)
          .click('.buybutton')
          .waitForVisible('#begin-round',10000)
          .click("#begin-round")
          .waitForVisible('#begin-round-btn',10000)
          .click("#begin-round-btn")
        }
       
      });
    test.after.always(async t => {
        await client.end();
    });

    test('Has correct title', async t => {
      if(testsRun %2 !== 0){
        console.log('inside 1=0');
        return client.click('.buybutton')
          .elements('.cardlist').then(function (cardlist) {
            t.is(cardlist.value.length, 1);
        });
      }else{
        return client.getTitle().then(result => {
            t.is(result, "Settlers of Massey");
        });
      }   
    });
        // return client.getTitle().then(result => {
        //     t.is(result, "Settlers of Massey");
        // });

      return true;
}
var superQuickTests = {
    'Windows 10': {
      'firefox': {
        startVersion: 55,
        endVersion: 55
      },
      'screenResolution' : '1280x1024'
    }
  }

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
          var driver = "";
          //var driver = buildDriver(os + "", browser + "", version + "", testTitles[j] + " - ");
          popups_display_and_close(testTitles[j], driver, os, browser, version, testsRun);
          testsRun++;
          popups_display_and_close(testTitles[j], driver, os, browser, version, testsRun);
          testsRun++;
        }
      }
    }
  }
}