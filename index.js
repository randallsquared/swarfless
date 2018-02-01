const urlparse = require('url').parse;
const matcher = require('path-match')();
const Boom = require('boom');

const MIDDLEWARE = '_mid';
const METHODS = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  opt: 'OPTIONS',
  options: 'OPTIONS',
  del: 'DELETE',
  delete: 'DELETE',
  head: 'HEAD',
  use: MIDDLEWARE,
  mid: MIDDLEWARE,
};

class Router {

  constructor() {
    this.routes = {};
    for (const [name, builder] of this.get_builders()) {
      this[name] = builder;
    }
  }

  // this is separate from get_builders because it might
  // be used explicitly by Router users for methods not
  // already given, like PATCH
  get_builder(given_method) {
    const method = given_method.toLowerCase();
    return (path, handler) => {
      this.add_route(method, path, handler);
    };
  }

  get_builders() {
    return Object
      .entries(METHODS)
      .map(([name, method]) => [name, this.get_builder(method)]);
  }

  get_route_handler() {
    return this.route.bind(this);
  }

  add_route(method, path, handler) {
    const rank = path.split('/').length;
    const match = matcher(path);
    const pack = { rank, match, handler };
    if (!(method in this.routes)) this.routes[method] = [];
    this.routes[method].push(pack);
    this.routes[method].sort((a, b) => b.rank - a.rank);
  }

  check_handler(handler_pack, req) {
    const { match, handler } = handler_pack;
    const params = match(urlparse(req.url).pathname);

    if (params === false) return undefined;

    if (req.params) req.params_history.push(req.params);
    req.params = params;
    return handler;
  }

  async route (req, res) {
    const packs = this.routes[req.method.toLowerCase()] || [];
    for (const pack of packs) {
      const handler = this.check_handler(pack, req);
      if (!handler) continue;
      req.handler = handler;
      break;
    }

    req.params_history = [];
    if (!res.finished) {
      // check middleware backwards, because '/' is before '/something'
      const packs = this.routes[MIDDLEWARE] || [];
      let left = packs.length;
      while (left--) {
        const middleware = this.check_handler(packs[left], req);
        if (middleware) await middleware(req, res);
      }
    }
    if (res.finished) return void null;
    if (req.handler) return req.handler(req, res);

    throw Boom.notFound('Not found');
  }
}

module.exports = Router;

