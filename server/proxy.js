const request = require('request');
const cache = require('memory-cache');
const format = require('./format-url');
const Config = require('./config');

const CACHE_ENABLED = true;
const PROD_CACHE_DURATION = 1 * 10 * 60 * 1000;     // 10 minutes
const DEV_CACHE_DURATION = 10 * 1000;               // 10 seconds
const CACHE_DURATION = Config.ENV == 'production' ? PROD_CACHE_DURATION : DEV_CACHE_DURATION;

function requestThenCache(options, res, proxyOptions) {
    request(options, function(error, response, body) {
        res
          .status(response.statusCode)
          .set('Content-Type', options.contentType)
          .send(error || body);

        if(response.statusCode == 200 && !error && proxyOptions.cache) {
            cache.put(options.url, {
                statusCode: response.statusCode,
                body: body
            }, CACHE_DURATION);
        }
    });
}

function to(path, options_, proxyOptions_) {
    const options = Object.assign({
        headers: {},
        contentType: 'application/json'
    }, options_);
    const proxyOptions = Object.assign({
        cache: true
    }, proxyOptions_);

    return (req, res) => {
        let url = format(path, req.params);
        let cachedResponse = cache.get(url);
        options.url = url;

        if(CACHE_ENABLED && cachedResponse && proxyOptions.cache && req.query.force != 'true') {
            console.log(`Using cached response for ${url}`);
            res.status(cachedResponse.statusCode).send(cachedResponse.body);
        } else {
            console.log(`Fetching new response for ${url}`);
            requestThenCache(options, res, proxyOptions);
        }
    }
}

module.exports = {
    to
};