var test = require('ava');

var names = require('./names.js');

// Test Bob...
test('Bob\'s name should be equal to "Bob"', function(t) {
    t.true("Bob" == names.bobsName());
});

// Test Tim...
test('Tim\'s name should be equal to "Tim"', function(t) {
    t.true("Tim" == names.timsName());
});