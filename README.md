# swarfless

A nano router for Zeit's [micro](https://github.com/zeit/micro)

```
const micro = require('micro');
const { get, post, route } = require('swarfless');


get('/', async () => 'Root of server');
get('/hello/:name', (req) => `Hi, ${req.params.name}`);

module.exports = route;
```
