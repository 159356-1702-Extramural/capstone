/**
 * Unit tests for chat.js
 */

var test=require('ava');

var chat=require('../app/game/chat.js');

test('encodeTag',function (t) {
  var s='&,<,>,",';
  var encodeStr=chat.prototype.encodeTags(s);
  var expected='&amp;,&lt;,&gt;,&quot;,';
  t.is(encodeStr,expected);

});