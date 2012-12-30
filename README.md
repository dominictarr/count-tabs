# count-tabs

Count the tabs that a user has open.

Also, assign a unique id for each tab.
Tabs cannot reuse the same id, 
because they do not share memory -- they are running in different VMs,
effectively a distributed system, if they can communicate.

``` js
var tabs = require('count-tabs')(function (up) {
  document.getElementById('tabs_counter').innerText = up
})

document.getElementById('my_id').innerText = tabs.id
```

## License

MIT
