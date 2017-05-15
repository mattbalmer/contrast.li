import { mix } from './objects';

export type HttpResponse = {
    status: number,
    body: string
}
export type HttpOptions = {
    method?: string,
    url?: string,
    params?: Object,
    data?: Object,
    headers?: Object
}

/**
 * Execute an AJAX request.
 *
 * @param {string} method The HTTP method to use.
 * @param {string} url The URL to send teh request to.
 * @param {object=} params Key-value paris of query string parameters.
 * @param {*=} data The request body.
 * @param {headers=} headers Any headers to set.
 * @returns {Promise}
 */
interface IHttp {
    (HttpOptions): Promise<HttpResponse>
    get(url: string, config?: HttpOptions): Promise<HttpResponse>
}

let http = <IHttp>function({ method, url, params, data, headers }) {
    return new Promise((resolve, reject) => {
        let client = new XMLHttpRequest();
        let uri = url;

        if(params) {
            let queryString = '';
            for(let key in params) {
                if(!params.hasOwnProperty(key)) continue;
                let symbol = queryString ? '&' : '?';
                let s = `${symbol}${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
                queryString += s;
            }
            uri += queryString;
        }

        client.open(method, uri);

        if(headers) {
            for(let key in headers) {
                if(headers.hasOwnProperty(key)) {
                    let value = headers[key];
                    client.setRequestHeader(key, value);
                }
            }
        }

        if(data && (method == 'POST' || method == 'PUT' || method == 'PATCH')) {
            client.send(data);
        } else {
            client.send();
        }

        client.onload = function() {
            if(this.status >= 200 && this.status < 300) {
                resolve({
                    status: this.status,
                    body: this.response
                });
            } else {
                reject({
                    status: this.status,
                    body: this.response
                });
            }
        };

        client.onerror = function() {
            reject({
                status: this.status,
                body: this.response
            })
        };
    })
};

/**
 * Executes a GET request to the specified location.
 *
 * @param {string} url The URL to send the request to.
 * @param {object=} config The full configuration options.
 * @returns {Promise}
 */
http['get'] = (url, config = {}) => http(mix({
    url,
    method: 'GET'
}, config));

/**
 * Executes a POST request to the specified location.
 *
 * @param {string} url The URL to send the request to.
 * @param {*=} data The request body.
 * @param {object=} config The full configuration options.
 * @returns {Promise}
 */
http['post'] = (url, data, config = {}) => http(mix({
    url,
    data,
    method: 'POST'
}, config));

/**
 * Executes a PATCH request to the specified location.
 *
 * @param {string} url The URL to send the request to.
 * @param {*=} data The request body.
 * @param {object=} config The full configuration options.
 * @returns {Promise}
 */
http['patch'] = (url, data, config = {}) => http(mix({
    url,
    data,
    method: 'PATCH'
}, config));

export default http;