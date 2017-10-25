import test from 'ava';
var webdriverio = require('webdriverio');
var SauceLabs = require("saucelabs");
var username = "sumnerfit";
var accessKey = "e8a11001-6685-43c4-901b-042e862a93f4";
var saucelabs = new SauceLabs({
  username: username,
  password: accessKey
});

var superQuickTests = {
    'Windows 10': {
      'firefox': {
        startVersion: 54,
        endVersion: 55
      },
      'screenResolution' : '1280x1024'
    }
  }

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
    'MicrosoftEdge': {
      startVersion: 15,
      endVersion: 15
    }
  }
}
//   },
//   'Windows 8.1': {
//     'firefox': {
//       startVersion: 55,
//       endVersion: 55
//     },
//     'internet explorer': {
//       startVersion: 11,
//       endVersion: 11
//     }
//   },
//   'Linux': {
//     'firefox': {
//       startVersion: 45,
//       endVersion: 45
//     },
//     'chrome': {
//       startVersion: 48,
//       endVersion: 48
//     }
//   },
//   'Mac 10.12': {
//     'firefox': {
//       startVersion: 45,
//       endVersion: 45
//     },
//     'chrome': {
//       startVersion: 60,
//       endVersion: 60
//     },
//     'safari': {
//       startVersion: 10,
//       endVersion: 10
//     }
//   }
// }

var testCapabilities = quickTests;

var browserArray = [];
var arrayPointer = 0;

// Loop each Operating System
for (var os in testCapabilities) {

  //Loop through each Browser on that Operating System
  for (var browser in testCapabilities[os]) {

    // Loop through each version specified for that Browser
    for (var version = parseInt(testCapabilities[os][browser].startVersion); version <= parseInt(
        testCapabilities[os][browser].endVersion); version++) {

        browserArray.push({os:os, browser:browser, version:version})
    }
  }
}
var counter = 0;
async function popups_display_and_close(){
  
  var browser = browserArray[arrayPointer].browser;
  var os = browserArray[arrayPointer].os;
  var version = browserArray[arrayPointer].version;
  var testsRun = arrayPointer;
  var other_player = 'Player 2';
  if(arrayPointer % 2 !== 0){
    var other_player = browserArray[(arrayPointer-1)%4].browser + " " + browserArray[(arrayPointer-1)%4].version+"-"+(testsRun+1) % 2;
  }
  var player_name = browser + " " + version + "-" + (testsRun % 2);

  console.log(player_name + " -----> " + other_player);
  var testTitle = player_name + " | "+os
  var passedBool = false;
  arrayPointer++;

  var client = webdriverio.remote({
    desiredCapabilities: {
      browserName: browser,
      version: version,
      platform: os,
      tags: ['examples'],
      name: testTitle,
      screenResolution: "1024x768",

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
    user: username,
    key: accessKey,
    logLevel: 'silent'
  });

  test('Game tests', async t => {
    await client.init()
      .url('http://capstone-settlers.herokuapp.com/?startWithCards=3&setup=skip&fixedDice=true&dev_card=road_building')
      .click('#play')
      .setValue('#player-input', player_name )
      .click('#start-game').then(function(){
        if(testsRun % 2 === 0){
          return client.click('#start-2-players')
            .getTitle()
            .then(result => {
              t.is(result, "Settlers of Massey");
            }).end();
        }else{
          return client.waitForVisible('.game_list_row_title='+other_player+'\'s Game',10000)
            .click('.game_list_row_title='+other_player+'\'s Game' )
            .waitForVisible('#begin-round',10000)
            .click("#begin-round")
            .waitForVisible('#begin-round-btn',10000)
            .click("#begin-round-btn")
            .waitForVisible('.buybutton',10000)
            .click('.buybutton')
            .elements('.cardlist').then(function (cardlist) {
              t.is(cardlist.value.length, 1);
            })
            .click('.road_building')
            .waitForVisible('.btn-large',10000)
            .getText('.popup_subtitle')
            .then(function (elements){
              console.log(elements);
              t.is(elements, "Card cannot be played.");
            })
            .click(".btn-large")
            .click(".other_player0_cell")
            .getText('.player_score')
            .then(function (elements){
              console.log(elements);
              t.is(elements, "0 Victory Points!");
            })
            .click(".btn-large")
            .setValue('.chat_input', "Testing chat\uE007")
            .getText('.chat_message')
            .then(function (elements){
              console.log(elements);
              t.is(elements, player_name + " Testing chat");
            })
            .end();
      }
    })
  })
}

async function runTests(){
    popups_display_and_close();
    popups_display_and_close();
    popups_display_and_close();
    popups_display_and_close();
}

runTests();

