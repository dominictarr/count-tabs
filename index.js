var id
var KEY = 'tabsQuery'
var tabs = {}
var pattern = /^tabs:(.+)$/
var EventEmitter = require('events').EventEmitter

module.exports = function (listener) {

  var start = Date.now()
  var emitter = new EventEmitter(), oldUp = 0
  for( var key in localStorage) {
    var m
    if(m = pattern.exec(key)) {
      var _id = m[1]
      if(!id && Number(localStorage[key]) < start - 2000) {
        id = _id
        localStorage['tabs:'+id] = start //claim this key
      }
      tabs[_id] = Number(localStorage[key])
    }
  }

  console.log('initial tabs', tabs)

  if(!id) {
    id = '#'+Math.random()
    tabs[id] = localStorage['tabs:'+id] = start//claim this key
  }

  function count () {
    var now = Date.now()
    
    for(var _id in tabs) {
      if(Number(tabs[_id]) < now - 2000) {
        delete tabs[_id]
        delete localStorage['tabs:'+_id]
        emitter.emit('close', _id)
        change = true
      }
    }
    var up = Object.keys(tabs).sort()
    console.log('count', JSON.stringify(tabs))
    if(!oldUp || up.join('|') != oldUp.join('|')) {
      var l = oldUp.length
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

  if(listener) {
    emitter.on('change', listener)
    listener.call(emitter, emitter.up, 0)
  }
  return emitter
}

