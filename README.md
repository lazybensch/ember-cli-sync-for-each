# Ember-cli-sync-for-each

This addon provides you with a function to execute asynchronous callbacks synchronously on an array of objects. This is for example usefull if you want to save a list of models where each model depends on data that is returned by the backend for one of the previous models (such as the id). Or when you want to mass create a list of objects but also respect their order of creation for the timestamps generated by your backend. For more use cases see the guide section below.

## API

```javascript
syncForEach(array, callback, force, index);
```

| Parameter     | Description  |
| ------------- |:-----|
| array         | List of items for which the callback is going to be executed. |
| callback      | Function that is going to be executed synchronously for every item. |
| force         | If set to `true`, execution will not stop should the callback reject for one item. |
| index         | Specifies at what position the function should start traversing the array. (used internally) |


## Guide

### simple usage

When your user is able to mass create a list of todos and you retroactively want to commit them to your backend, varying network roundtrip times can mess with their order of creation. For most use cases this is fine, but sometimes your application depends on respecting that order. You can use `syncForEach` to throttle the `POST` requests in a way that every request will only be sent once the previous request returned successfully.

```javascript
import syncForEach from 'ember-cli-sync-for-each';

syncForEach(model.get('todos'), function(todo) {
  return todo.save();
});
```

### access enumerable

The callback additionally gives you access to the enumerable. You can use `syncForEach` therefor, to access resolved data from previous calls. In the following example we want to commit a list of new employees to our company. There is a policy that every new employee will be mentored by the last hired coworker. Since `syncForEach` will already have successfully saved all previous coworkers they will already have ids set by the backend that you can reference.

```javascript
syncForEach(employees, function(employee, index, employees) {
  previousEmployee = index === 0 ? null : employees[index-1];
  employee.set('mentor', previousEmployee);
  return employee.save();
});
```

### resolves upon completion

Since `syncForEach` will either resolve once it executed the callback for every item or rejects as soon as its callback rejects for one of the items, you can use it to asynchronously run code in either event.

```javascript
syncForEach(model.get('todos'), function(todo) {
  return todo.save();
}).then(function(todos){
  alert('The backend created todos with the following ids: ', todos.mapBy('id'));
});
```

### optionally resumes on rejection

`syncForEach`s default behaviour is to stop execution once one callback rejects, so the following code:

```javascript
syncForEach([1,2,3,4,5], function(item) {
  return new Ember.RSVP.Promise(function(resolve, reject){
    if (item === 3) {
      reject();
    } else {
      console.log(item);
      resolve();
    }
  });
});
```
will produce this output:
```
> 1
> 2
```
If you want the function to continue no matter what, you can set the optionally `force` flag to `true`. The promise that will be returned from `syncForEach` will still reject with the respective rejection message but your callback will be executed for the remaining items anyway.

```javascript
promise = syncForEach([1,2,3,4,5], function(item) {
  return new Ember.RSVP.Promise(function(resolve, reject){
    if (item === 3) {
      reject();
    } else {
      console.log(item);
      resolve();
    }
  });
}, true);

promse.then(function() {
  console.log('yay =D');
}, function() {
  console.log('nay D=');
});
```
will produce the following output:
```
> 1
> 2
> 4
> 5
> nay D=
```
### synchronous callback

`syncForEach` is smart enough to recognize wether your callback actually returns a promise and will behave like a normal `forEach` in case it does not. The function will still return a resolved promise in this case. So the following snippet:

```javascript
syncForEach(['foo', 'bar', 'baz'], function(word) {
  console.log(word);
});
```
will output:
```
> foo
> bar
> baz
```

## Installation

To use this addon in your project, just type:
```
$ ember install:addon ember-cli-sync-for-each
```
and then import the function whereever you need it:
```
import syncForEach from 'ember-cli-sync-for-each';
```

## Contributing

* `git clone https://github.com/lazybensch/ember-cli-sync-for-each`
* `cd ember-cli-sync-for-each`
* `npm install`
* `bower install`
* `ember test`
