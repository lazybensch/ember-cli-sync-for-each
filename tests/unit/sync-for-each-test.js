import Ember from 'ember';
import syncForEach from 'ember-cli-sync-for-each';
import { test } from 'ember-qunit';
import { module } from 'qunit';

var array;

module('sync-for-each', {
  beforeEach: function() {
    array = [1,2,3];
  }
});

test('it returns a promise which resolves', function(assert) {
  assert.expect(1);

  syncForEach(array, function() {
    return Ember.RSVP.Promise.resolve();
  }).then(function() {
    assert.ok(true);
  });
});

test('it returns a promise which resolves, given a synchronous callback', function(assert) {
  assert.expect(1);

  syncForEach(array, function() {
    return;
  }).then(function() {
    assert.ok(true);
  });
});

test('it returns a promise which rejects if one call rejects', function(assert) {
  assert.expect(1);

  syncForEach(array, function() {
    return Ember.RSVP.Promise.reject();
  }).then(null, function() {
    assert.ok(true);
  });
});

test('it returns a promise which resolves, given an empty array', function(assert) {
  assert.expect(1);

  syncForEach([], function() {
    return Ember.RSVP.Promise.resolve();
  }).then(function() {
    assert.ok(true);
  });
});

test('it works with array', function(assert) {
  assert.expect(2);

  var testArray = [];

  syncForEach(array, function(item) {
    testArray.push(item);
    return Ember.RSVP.Promise.resolve();
  }).then(function(result) {
    assert.equal(result, array, 'returns the input array');
    assert.deepEqual(testArray, array, 'executes in correct order');
  });
});

test('it works with DS.ManyArray', function(assert) {
  assert.expect(2);

  var manyArray = DS.ManyArray.create({content: array});
  var testArray = [];

  syncForEach(manyArray, function(item) {
    testArray.push(item);
    return Ember.RSVP.Promise.resolve();
  }).then(function(result) {
    assert.equal(result, manyArray, 'returns the input array');
    assert.deepEqual(testArray, array, 'executes in correct order');
  });
});

test('it rejects with the rejection reason', function(assert) {
  assert.expect(1);
  var msg = 'foo';

  syncForEach(array, function() {
    return Ember.RSVP.Promise.reject(msg);
  }).then(null, function(result) {
    assert.equal(result, msg);
  });
});

test('it executes callback on each item', function(assert) {
  assert.expect(array.length);

  syncForEach(array, function() {
    return new Ember.RSVP.Promise(function(resolve){
      assert.ok(true);
      resolve();
    });
  });
});

test('it stops execution after rejection', function(assert) {
  assert.expect(3);

  syncForEach([1,2,3,4,5], function(item) {
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

  syncForEach([1,2,3,4,5], function(item) {
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

  syncForEach(array, function() {
    return Ember.RSVP.Promise.reject(msg);
  }, true).then(null, function(reason){
    assert.equal(reason, msg);
  });
});

test('it makes index, and input array available in callback', function(assert) {
  assert.expect(3);

  syncForEach(array, function(item, index, array) {
    return new Ember.RSVP.Promise(function(resolve){
      assert.equal(item, array[index]);
      resolve();
    });
  });
});

test('it works for ember instances', function(assert) {
  assert.expect(1);

  array = ['foo', 'bar', 'baz'].map(function(name) {
    return Ember.Object.create({
      name: name,
      rename: function(name) {
        var _this = this;
        return new Ember.RSVP.Promise(function(resolve){
          _this.set('name', name);
        });
      }
    });
  });

  syncForEach(array, function(item) {
    item.rename('bar');
  }).then(function(result) {
    assert.deepEqual(result.mapBy('name'), ['bar', 'bar', 'bar']);
  });
});
