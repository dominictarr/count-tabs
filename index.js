var EventEmitter = require('events').EventEmitter
var hash = require('sha1sum')

var id
var KEY = 'tabsQuery'
var tabs = {}
var pattern = /^tabs:(.+)$/
var emitter, oldUp
module.exports = function (listener) {

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
      if(!id && Number(localStorage[key]) < start - 2000) {
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
      if(Number(tabs[_id]) < now - 2000) {
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
  }, 1000)

  attach()

  return emitter
}

