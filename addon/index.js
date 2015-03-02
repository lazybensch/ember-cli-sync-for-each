import Ember from 'ember';

var staggeredCall = function(array, func, index){
  index = Ember.typeOf(index) === 'undefined' ? 0 : index;

  return new Ember.RSVP.Promise(function(resolve, reject) {
    if (index < array.length) {

      func.call(this, array[index], index, array).then( function() {
        staggeredCall(array, func, ++index).then(resolve, reject);
      });

    } else {

      resolve(array);

    }
  });
};

export default staggeredCall;
