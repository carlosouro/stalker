# stalker-pattern
![stalker-pattern NPM package information](https://nodei.co/npm/stalker-pattern.png "stalker-pattern NPM package information")

![stalker-pattern travis-CI build](https://travis-ci.org/carlosouro/stalker-pattern.svg "stalker-pattern travis-CI build") ![stalker-pattern test coverage](https://coveralls.io/repos/carlosouro/stalker-pattern/badge.svg "stalker-pattern test coverage")

Stalker-pattern is a Javascript pattern with a promise-like syntax streaming but in which the whole stream is re-triggerable like an event. Additionally it also supports synchronous triggering.

---
##API
A basic notion of [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) will help you easily understand this pattern.

### <a name="basics"></a>Basics

```JavaScript
var Stalker = require('stalker-pattern');

var myStalker = new Stalker(function(trigger){
  trigger("hi!");
});

myStalker.follow(function(result){
  console.log(result); //prints "hi!"
});

```


### <a name="basics"></a>Chaining stalkers

```JavaScript
var myStalker = new Stalker(function(trigger){

  trigger(new Stalker(function(t){
    t("More complex");

    setTimeout(function(){
      t("Async");
    })
  }));

}).follow(function(result){

  return new Stalker(function(t2){
    t2(result+" hi!");
  });

}).follow(function(result){

  // prints "More complex hi!",
  // and then on next tick prints "Async hi!"
  console.log(result);

});

```