var EventEmitter = require('events').EventEmitter
var hash = require('shasum')

var id
var KEY = 'tabsQuery'
var tabs = {}
var pattern = /^tabs:(.+)$/
var emitter, oldUp

//NOTE. this module uses a global singleton,
//so the first thing to require it must set the interval
//else, you will be stuck with the default.

//disabling the interval option for now.
//is unstable under 500 ms.
module.exports = function (/*interval, */listener) {
  //if('function' === typeof interval)
  //  listener = interval, interval = 1000
  var interval = 500

  function attach() {
    if(listener) {
      emitter.on('change', listener)
      listener.call(emitter, emitter.up, 0)
    }
  }

  if(emitter) {
    attach()
    return emitter
  }

  emitter = new EventEmitter()

  emitter.tabs = tabs

  var start = Date.now()
  for( var key in localStorage) {
    var m
    if(m = pattern.exec(key)) {
      var _id = m[1]
      if(!id && Number(localStorage[key]) < start - interval*2) {
        emitter.id = id = _id
        localStorage['tabs:'+id] = start //claim this key
      }
      tabs[_id] = Number(localStorage[key])
    }
  }

  if(!id) {
    emitter.id = id = hash(Date.now())
    tabs[id] = localStorage['tabs:'+id] = start//claim this key
  }

  function count () {
    var now = Date.now()
    
    for(var _id in tabs) {
      if(Number(tabs[_id]) < now - interval*2) {
        delete tabs[_id]
        //don't delete old ids, so they can be reused,
        //making for smaller vector-clocks.
        //delete localStorage['tabs:'+_id]
        emitter.emit('close', _id)
        change = true
      }
    }
    var up = Object.keys(tabs).sort()
    if(!oldUp || up.join('|') != oldUp.join('|')) {
      var l = oldUp ? oldUp.length : 0
      emitter.up = up.length
      oldUp = up
      emitter.emit('change', tabs, l)
    }
  }

  count()

  window.addEventListener('storage', function (se) {
    if(m = pattern.exec(se.key)) {
      var _id = m[1]
      if(se.newValue)
        tabs[_id] = Number(se.newValue)
      else
        delete tabs[_id] 
      count()
    }
  })  

  setInterval(function () {
    tabs[id] = localStorage['tabs:'+id] = Date.now()
    count()
  }, interval)

  attach()

  return emitter
}

