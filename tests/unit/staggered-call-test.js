import Ember from 'ember';
import staggeredCall from 'ember-cli-staggered-call';
import { test } from 'ember-qunit';

test('it returns a promise which resolves', function(assert) {
  assert.expect(1);

  staggeredCall([1,2,3], function() {
    return Ember.RSVP.Promise.resolve();
  }).then(function() {
    assert.ok(true);
  });
});

test('it returns a promise which rejects if one call rejects', function(assert) {
  assert.expect(1);

  staggeredCall([1,2,3], function() {
    return Ember.RSVP.Promise.reject();
  }).then(null, function() {
    assert.ok(true);
  });
});

test('it returns a promise which resolves, given an empty array', function(assert) {
  assert.expect(1);

  staggeredCall([], function() {
    return Ember.RSVP.Promise.resolve();
  }).then(function() {
    assert.ok(true);
  });
});

test('it resolves with the input array', function(assert) {
  assert.expect(1);

  var array = [1,2,3];

  staggeredCall(array, function() {
    return Ember.RSVP.Promise.resolve();
  }).then(function(result) {
    assert.equal(result, array);
  });
});

test('it rejects with the rejection reason', function(assert) {
  assert.expect(1);
  var msg = 'foo';

  staggeredCall([1,2,3], function() {
    return Ember.RSVP.Promise.reject(msg);
  }).then(null, function(reason) {
    assert.equal(reason, msg);
  });
});
