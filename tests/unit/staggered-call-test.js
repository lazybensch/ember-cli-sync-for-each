import Ember from 'ember';
import staggeredCall from 'ember-cli-staggered-call';
import { test } from 'ember-qunit';
import { module } from 'qunit';

var array;

module('staggered-call', {
  beforeEach: function() {
    array = [1,2,3];
  }
});

test('it returns a promise which resolves', function(assert) {
  assert.expect(1);

  staggeredCall(array, function() {
    return Ember.RSVP.Promise.resolve();
  }).then(function() {
    assert.ok(true);
  });
});

test('it returns a promise which resolves, given a synchronous callback', function(assert) {
  assert.expect(1);

  staggeredCall(array, function() {
    return;
  }).then(function() {
    assert.ok(true);
  });
});

test('it returns a promise which rejects if one call rejects', function(assert) {
  assert.expect(1);

  staggeredCall(array, function() {
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

  staggeredCall(array, function() {
    return Ember.RSVP.Promise.resolve();
  }).then(function(result) {
    assert.equal(result, array);
  });
});

test('it rejects with the rejection reason', function(assert) {
  assert.expect(1);
  var msg = 'foo';

  staggeredCall(array, function() {
    return Ember.RSVP.Promise.reject(msg);
  }).then(null, function(result) {
    assert.equal(result, msg);
  });
});

test('it executes callback on each item', function(assert) {
  assert.expect(array.length);

  staggeredCall(array, function() {
    return new Ember.RSVP.Promise(function(resolve){
      assert.ok(true);
      resolve();
    });
  });
});

test('it stops execution after rejection', function(assert) {
  assert.expect(3);

  staggeredCall([1,2,3,4,5], function(item) {
    return new Ember.RSVP.Promise(function(resolve, reject){
      assert.ok(true);
      if (item === 3) {
        reject();
      }
      resolve();
    });
  });
});

test('it continues execution after rejection, when force is set', function(assert) {
  assert.expect(5);

  staggeredCall([1,2,3,4,5], function(item) {
    return new Ember.RSVP.Promise(function(resolve, reject){
      assert.ok(true);
      if (item === 3) {
        reject();
      }
      resolve();
    });
  }, true);
});

test('it rejects with the rejection reason, when force is set', function(assert) {
  assert.expect(1);
  var msg = 'foo';

  staggeredCall(array, function() {
    return Ember.RSVP.Promise.reject(msg);
  }, true).then(null, function(reason){
    assert.equal(reason, msg);
  });
});

test('it makes index, and input array available in callback', function(assert) {
  assert.expect(3);

  staggeredCall(array, function(item, index, array) {
    return new Ember.RSVP.Promise(function(resolve){
      assert.equal(item, array[index]);
      resolve();
    });
  });
});
