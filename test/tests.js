//START TESTS
var assert = require('assert');
var Stalker, sync;

//blanket to test nature.js file coverage
if(process.env.YOURPACKAGE_COVERAGE) require('blanket')({"data-cover-only":'stalker.js', "data-cover-never":'node_modules'});

beforeEach(function(){
  sync = true
})

describe('stalker', function(){

  it('should not have syntax errors', function(done){
    Stalker = require('../stalker.js');
    done();
  });
  it('should initialise an instance', function(done){
    new Stalker(function(){
      done();
    });
  });
  it('should respect basic pattern (async)', function(done){

    (new Stalker(function(trigger){
      setTimeout(function(){
        trigger(1);
      },0);
    })).follow(function(o){
      assert.equal(o,1);
      assert(!sync, 'async');
      done();
    });

    sync = false;

  });
  it('should respect basic pattern (sync)', function(done){


    (new Stalker(function(trigger){
      trigger(1);
    })).follow(function(o){
      assert.equal(o,1);
      assert(sync, 'async');
      done();
    })

    sync = false;
  });

  it('should follow a stalker instance (async-async)', function(done){

    (new Stalker(function(trigger){
      setTimeout(function(){
        trigger(new Stalker(function(t){
          setTimeout(function(){
            t(1)
          },0);
        }));
      },0);
    })).follow(function(o){
      assert.equal(o,1);
      assert(!sync, 'async');
      done();
    });

    sync = false;

  });

  it('should follow a stalker instance (sync-async)', function(done){

    (new Stalker(function(trigger){

      trigger(new Stalker(function(t){
        setTimeout(function(){
          t(1)
        },0);
      }));
    })).follow(function(o){
      assert.equal(o,1);
      assert(!sync, 'async');
      done();
    });

    sync = false;

  });

  it('should follow a stalker instance (async-sync)', function(done){

    (new Stalker(function(trigger){
      setTimeout(function(){
        trigger(new Stalker(function(t){
          t(1)
        }));
      },0);
    })).follow(function(o){
      assert.equal(o,1);
      assert(!sync, 'async');
      done();
    });

    sync = false;

  });

  it('should follow a stalker instance (sync-sync)', function(done){

    (new Stalker(function(trigger){
      trigger(new Stalker(function(t){
        t(1)
      }));
    })).follow(function(o){
      assert.equal(o,1);
      assert(sync, 'sync');
      done();
    });

    sync = false;

  });

  it('should follow a stalker instance twice (async)', function(done){

    (new Stalker(function(trigger){
      setTimeout(function(){
        trigger(1);
      });
    })).follow(function(o){
      return o+1;
    }).follow(function(o){
      assert(o,2);
      assert(!sync, 'async');
      done();
    });

    sync = false;

  });

  it('should follow a stalker instance twice (sync)', function(done){

    (new Stalker(function(trigger){
      trigger(1);
    })).follow(function(o){
      return o+1;
    }).follow(function(o){
      assert(o,2);
      assert(sync, 'sync');
      done();
    });

    sync = false;

  });

  it('should follow a stalker instance twice, triggered 3x (async)', function(done){

    var times = 0, secondSync = true;

    (new Stalker(function(trigger){
      setTimeout(function(){
        trigger(new Stalker(function(t){
          t(1)
        }));
        trigger(2);
        trigger(new Stalker(function(t){
          t(3)
        }));
        secondSync = false;
      });
    })).follow(function(o){
      return o+1;
    }).follow(function(o){

      if(times===0){
        times++
        assert(o,2);
        assert(!sync, 'async');
        assert(secondSync, 'sync in second stage');
      } else if(times===1){
        times++
        assert(o,3);
        assert(secondSync, 'sync in second stage');
      } else {
        assert(o,4);
        assert(secondSync, 'sync in second stage');
        done();
      }
    });

    sync = false;

  });

  it('should follow a stalker instance twice, triggered 3x (sync)', function(done){

    var times = 0;

    (new Stalker(function(trigger){
      trigger(new Stalker(function(t){
        t(1)
      }));
      trigger(2);
      trigger(new Stalker(function(t){
        t(3)
      }));
    })).follow(function(o){
      return o+1;
    }).follow(function(o){
      if(times===0){
        times++
        assert(o,2);
        assert(sync, 'sync');
      } else if(times===1){
        times++
        assert(o,3);
        assert(sync, 'sync');
      } else {
        assert(o,4);
        assert(sync, 'sync');
        done();
      }
    });

    sync = false;

  });

  it('should follow stalker instances - complex (async)', function(done){

    (new Stalker(function(trigger){
      setTimeout(function(){
        trigger(new Stalker(function(t){
          t(1)
        }));
      },0);
    })).follow(function(o){
      return new Stalker(function(t){
        setTimeout(function(){
          t(new Stalker(function(t2){
            t2(o+1);
          }));
        },0);
      });
    }).follow(function(o){
      assert(o,2);
      assert(!sync, 'async');
      done();
    });

    sync = false;

  });


  it('should follow stalker instances - complex (sync)', function(done){

    (new Stalker(function(trigger){
      trigger(new Stalker(function(t){
        t(1)
      }));
    })).follow(function(o){
      return new Stalker(function(t){
        t(new Stalker(function(t2){
          t2(o+1);
        }))
      });
    }).follow(function(o){
      assert(o,2);
      assert(sync, 'sync');
      done();
    });

    sync = false;

  });

  it('can handle very complex logics (mixed sync and async)', function(done){

    var validations=0, retrigger, internalReTrigger, internalReTrigger2, expectedSync = true, expectedSyncStr = 'sync', resolved={};

    (new Stalker(function(trigger){

      retrigger = trigger;

      trigger(new Stalker(function(t){
        if(!internalReTrigger) internalReTrigger = t; //assign only first time
        t(0)
        t(1)
      }));

      //internalReTrigger(1);
      trigger(2);

    })).follow(function(o){

      return new Stalker(function(t){
        t(new Stalker(function(t2){
          if(!internalReTrigger2) internalReTrigger2 = t2; //assign only first time
          t2(o+1);
        }));
      });
    }).follow(function(o){

      switch(o){
        case 1:
          assert.equal(sync, expectedSync, expectedSyncStr);
          break;
        case 2:
          assert.equal(sync, expectedSync, expectedSyncStr);
          retrigger(3);
          internalReTrigger2(5);
          break;
        case 3:
          assert.equal(sync, expectedSync, expectedSyncStr);
          internalReTrigger(5);
          break;
        case 4:
          assert.equal(sync, expectedSync, expectedSyncStr);
          break;
        case 5:
          assert(5===o);
          assert.equal(sync, expectedSync, expectedSyncStr);
          break;
        case 6:
          assert(6===o);
          assert.equal(sync, expectedSync, expectedSyncStr);
          break;
        default:
        assert.throw("Unexpected resulting value");
      }

      validations++;

      if(!resolved[""+o]) resolved[""+o]=0;
      resolved[""+o]++;

      //sync to async pass
      if(validations==6){
        //prep async re-use
        var rasync = retrigger;
        retrigger = function(a){
          setTimeout(function(){
            rasync(a);
          })
        }
        var irasync = internalReTrigger;
        internalReTrigger = function(b){
          setTimeout(function(){
            irasync(b);
          })
        }

        expectedSync = false;
        expectedSyncStr = 'async';

        retrigger(0)
        internalReTrigger(1);
        retrigger(2)

      } else if(validations==12){
        //final validation
        //check that all have resolved
        var results = Object.keys(resolved);
        assert.equal(results.length, 6);
        results.forEach(function(e){
          assert.equal(resolved[e], 2, e+' failed with count '+resolved[e]);
        })

        done();
      }

    });

    sync = false;

  });

  it('is protected against anti-pattern', function(done){

    assert.throws(function(){
      (new Stalker(function(trigger){
        var stalker = new Stalker(function(t){
          t(1)
        });
        stalker.follow(function(){});
        trigger(stalker);
      })).follow(function(){});
    });

    assert.throws(function(){
      (new Stalker(function(trigger){
        trigger(1);
      })).follow(function(o){
        var stalker = new Stalker(function(t){
          t(o);
        });
        stalker.follow(function(){});
        return stalker;
      }).follow(function(){});
    });

    done();

  });

  it('follow method does not work in a different context', function(done){

    var a = new Stalker(function(trigger){
        trigger(1)
    });

    var b = new Stalker(function(trigger){
        trigger(1)
    });

    b.follow = a.follow;

    assert.throws(function(){
      b.follow(function(){});
    });

    done();

  });

  it('piping through .first()', function(done){
    var trigger;
    new Stalker(function(t){
        trigger=t;
    }).first().follow(function(val){
      assert(val)
    });

    trigger(true)
    trigger(false)

    done();

  });

  it('piping through .the(nthTime)', function(done){
    var trigger, times=0;
    new Stalker(function(t){
        trigger=t;
    }).the(3).follow(function(val){
      times++;
      assert(val)
    });

    trigger(false)
    trigger(false)
    trigger(true)
    trigger(false)

    done();

  });

  it('piping through .from(nthTime).to(nthTime)', function(done){
    var trigger, times=0;
    new Stalker(function(t){
        trigger=t;
    }).from(2).to(5).follow(function(val){
      times++;
      assert(val)
    });

    trigger(false)
    trigger(true)
    trigger(true)
    trigger(true)
    trigger(true)
    trigger(false)
    assert.equal(times, 4)

    done();

  });

  it('should pipe as in readme', function(done){
    var res = '';
    new Stalker(function(trigger){

      trigger(1);
      trigger(2);
      trigger(3);
      trigger(4);

    }).from(1).to(3).follow(function(number){

      res+=number; //prints 1,2,3
      return number;

    }).the(2).follow(function(number){

      res+=number; //prints 2
      return number;

    }).first().follow(function(number){

      res+=number; //prints 2

    });

    assert.equal(res, '12322');
    done();
  })

});