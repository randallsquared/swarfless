# swarfless

A nano router for Zeit's micro

```
const micro = require('micro');
const { get, post, route } = require('swarfless');


get('/', async () => 'Root of server');
get('/hello/:name', (req) => `Hi, ${req.params.name}`);

module.exports = route;
```
