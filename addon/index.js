import Ember from 'ember';

var syncForEach = function(enumerable, callback, force, index){
  index = Ember.typeOf(index) === 'undefined' ? 0 : index;
  force = Ember.typeOf(force) === 'undefined' ? false : force;

  var array = enumerable.get('content') || enumerable;

  return new Ember.RSVP.Promise(function(resolve, reject) {
    if (index < array.length) {

      var result = callback.call(this, array[index], index, array);

      if (result && Ember.typeOf(result['then']) === 'function') {

        if (force) {
          result.then(null,reject).finally(function() {
            syncForEach(enumerable, callback, force, ++index).then(resolve, reject);
          });
        } else {
          result.then( function() {
            syncForEach(enumerable, callback, force, ++index).then(resolve, reject);
          }, reject);
        }
      } else {

        syncForEach(enumerable, callback,force,  ++index).then(resolve, reject);
      }

    } else {

      resolve(enumerable);
    }
  });
};

export default syncForEach;
