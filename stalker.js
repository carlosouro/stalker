
// UMD pattern - https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Stalker = factory();
  }
}(this, function () {


  // Stalker-pattern - by Carlos Ouro

  // helper - delete piping functions
  function deletePipes(obj, deleteTo){
    delete obj.first;
    delete obj.from;
    delete obj.the;
    if(deleteTo) delete obj.to;
  }

  // Note: logging functionality is commented out for performance reasons,
  // if needed uncomment and pass in a logging method (eg. console.log.bind(console) )

  // main stalker class
  var Stalker = function(initialise, name /*, logger*/ ){

    var self = this, pending = [], sync = true, nameStr = name ? "\""+name+"\" " : "", occurrences = 0;

    Object.defineProperty(this, "stalker-pattern:instance-name", {value:name})
    Object.defineProperty(this, "stalker-pattern:enabled", {value:true})
    Object.defineProperty(this, "stalker-pattern:first", {value:1, writable:true})
    Object.defineProperty(this, "stalker-pattern:last", {value:Infinity, writable:true})

    // trigger() - pushes the result in the queue and, on async use,
    // fires push logic to follow callback
    function trigger(result){

      //console.log('pushing ', result)

      // if(logger) logger('triggered '+name)

      // save result
      pending.push(result);

      // trigger (async use)
      if(!sync) fireAll();

    }

    // fireAll() - fires follow() logic callbacks *OR* propagates
    // through pending stalker instances and then retriggers itself with the output
    function fireAll(){

      // if(logger) logger('firing all pending callbacks on '+name)
      //console.log(pending)

      var item;
      // for each item left on the pending stack (remember, can be triggered multiple times)
      while(pending.length){

        item = pending.shift();
        //console.log('firing ', item)

        occurrences++;
        if(occurrences>=self["stalker-pattern:first"] && occurrences<= self["stalker-pattern:last"]){
          // check if Stalker instance
          if(item && item["stalker-pattern:enabled"]){
            // protect against anti-pattern use
            if(!item.follow){
              throw new Error("Stalker "+nameStr+"error: you've used trigger(stalkerInstance) which already has a .follow() assigned");
            }
            // follow the result of the given stalker instance with a re-trigger on
            // this instance (ability to follow indefinetely)
            item.follow(trigger);
          } else {
            // trigger follow
            self["stalker-pattern:follow-cb"] && self["stalker-pattern:follow-cb"](item)
          }
        }

      }

    }

    // .follow() - assigns follow callback and retriggers this instance to
    // push any sync pending results through to callback
    this.follow = function(cb){

      // protect against anti-pattern misuse
      if(self !== this){
        throw new Error("Stalker "+nameStr+"error: .follow() method only works in the context of the declared instance.");
      }

      // the current instance can no longer be followed or piped
      deletePipes(this, true);
      delete this.follow;

      var followName = (this["stalker-pattern:instance-name"] || 'anonymous')+'.follow';

      // logger
      // if(logger) logger("called "+followName+"()")

      // create a new stalker instance that will be triggered by every call to this follow-cb
      var ret = new Stalker(function(trigger){

        // define trigger
        Object.defineProperty(self, "stalker-pattern:follow-cb", {
          value:function(obj){
            trigger(cb(obj));
          }
        })

        // in case there are any left to trigger (sync use)
        fireAll();

      }, followName /*, logger*/);



      // return new stalker instance
      return ret;
    }

    // if(logger) logger("initialising "+name)
    initialise(trigger);

    // if(logger) logger("finished "+name)
    sync=false;
  }

  Stalker.prototype.first = function() {
    this["stalker-pattern:first"]=1;
    this["stalker-pattern:last"]=1;
    deletePipes(this, true);
    return this;
  };
  Stalker.prototype.the = function(time) {
    this["stalker-pattern:first"]=time;
    this["stalker-pattern:last"]=time;
    deletePipes(this, true);
    return this;
  };
  Stalker.prototype.from = function(time) {
    this["stalker-pattern:first"]=time;
    deletePipes(this);
    return this;
  };
  Stalker.prototype.to = function(time) {
    this["stalker-pattern:last"]=time;
    deletePipes(this, true);
    return this;
  };

  return Stalker;
}));


