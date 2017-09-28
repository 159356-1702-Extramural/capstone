var test = require('ava');

var Shuffler = require('../app/helpers/shuffler.js');

test('Returns array in different order', function (t) {
  var shuffler = new Shuffler();

  var compare = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  var shuffled = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  shuffled = shuffler.shuffle(shuffled);

  // check that the order is different
  var are_same = true;

  for (var i = 0; i < compare.length; i++) {
    if (compare[i] !== shuffled[i]) are_same = false;
  }

  t.false(are_same);
});
