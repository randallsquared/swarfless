# swarfless

A nano router for Zeit's [micro](https://github.com/zeit/micro)

```
const micro = require('micro');
const Swarfless = require('swarfless');
const r = new Swarfless();


r.get('/', async () => 'Root of server');

// or
const { get, post } = r;

get('/hello/:name', async (req) => `Hi, ${req.params.name}`);
post('/set-name/:name', async (req) => `Setting name to ${req.params.name}`);

module.exports = r.get_route_handler();
```

## Changes

Version 2 has changes to avoid storing the route in the module itself, which interferes with hot-reloading from micro-dev.  Due to those changes, you must now create a Swarfless instance before using the route-building methods.

