import Ember from 'ember';

var syncForEach = function(array, callback, force, index){
  index = Ember.typeOf(index) === 'undefined' ? 0 : index;
  force = Ember.typeOf(force) === 'undefined' ? false : force;

  return new Ember.RSVP.Promise(function(resolve, reject) {
    if (index < array.length) {

      var result = callback.call(this, array[index], index, array);

      if (Ember.typeOf(result) === 'object' && Ember.typeOf(result.then) === 'function') {

        if (force) {
          result.then(null,reject).finally(function() {
            syncForEach(array, callback, force, ++index).then(resolve, reject);
          });
        } else {
          result.then( function() {
            syncForEach(array, callback, force, ++index).then(resolve, reject);
          }, reject);
        }
      } else {

        syncForEach(array, callback,force,  ++index).then(resolve, reject);
      }

    } else {

      resolve(array);
    }
  });
};

export default syncForEach;
