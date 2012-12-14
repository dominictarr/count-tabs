

var tabs = require('..')(function () {
  console.log(this.up)
  document.getElementById('N').innerText = this.up
})




