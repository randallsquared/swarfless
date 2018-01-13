const urlparse = require('url').parse;
const matcher = require('path-match')();
const Boom = require('boom');

class Router {}

const routes = {
  post: [],
  get: [],
  put: [],
  del: [],
  options: [],
  head: [],
  _mid: [],
};

const add_route = (method, path, handler) => {
  const rank = path.split('/').length;
  const match = matcher(path);
  const pack = {
    rank,
    match,
    handler
  };
  routes[method].push(pack);
  routes[method].sort((a, b) => b.rank - a.rank);
};

const post = (path, handler) => {
  add_route('post', path, handler);
};

const get = (path, handler) => {
  add_route('get', path, handler);
};

const put = (path, handler) => {
  add_route('put', path, handler);
};

const del = (path, handler) => {
  add_route('del', path, handler);
};

const options = (path, handler) => {
  add_route('options', path, handler);
};

const head = (path, handler) => {
  add_route('head', path, handler);
};

const mid = (path, handler) => {
  add_route('_mid', path, handler);
};

const check_handler = (handler_pack, req) => {
  const {
    match,
    handler
  } = handler_pack;
  const params = match(urlparse(req.url).pathname);

  if (params === false) return undefined;

  if (req.params) req.params_history.push(req.params);
  req.params = params;
  return handler;
};

const route = async(req, res) => {
  const packs = routes[req.method.toLowerCase()];
  for (const pack of packs) {
    req.handler = req.handler || check_handler(pack, req);
  }

  req.params_history = [];
  if (!res.finished) {
    // check middleware backwards, because '/' is before '/something'
    const packs = routes['_mid'];
    let left = packs.length;
    while (left--) {
      const middleware = check_handler(packs[left], req);
      if (middleware) await middleware(req, res);
    }
  }
  if (res.finished) return void null;
  if (req.handler) return req.handler(req, res);

  throw Boom.notFound('Not found');

};

Router.get = get;
Router.post = post;
Router.put = put;
Router.del = del;
Router.options = options;
Router.head = head;
Router.mid = mid;
Router.route = route;
Router.Router = Router;

module.exports = Router;

