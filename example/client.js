

var tabs = require('..')(function () {
  console.log(this.up)
  document.getElementById('tabs_counter').innerText = this.up
})




