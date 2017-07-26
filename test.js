var test = require('ava');

var names = require('./names.js');

// Test Tim...
test('Tim\'s name should be equal to "Tim"', function(t) {
    t.true("Bob" == names.bobsName());
});