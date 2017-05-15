function extend(src, ...objects) {
    for(let i in objects) {
        if(!objects.hasOwnProperty(i)) continue;
        let obj = objects[i];
        for(let key in obj) {
            if(!obj.hasOwnProperty(key)) continue;
            if(obj[key] && typeof obj[key] == 'object' && obj[key].constructor == Object) {
                src[key] = mix({}, obj[key]);
            } else {
                src[key] = obj[key];
            }
        }
    }
    return src;
}

function mix(src, ...objects) {
    let copy = extend({}, src);
    return extend(copy, ...objects);
}

function retrieve(source, path) {
    if (path.indexOf('.') < 0) {
        return source[path];
    } else {
        let parts = path.split('.');
        return retrieve(source[parts[0]], parts.slice(1).join('.'));
    }
}

function assign(source, path, data) {
    if (path.indexOf('.') < 0) {
        source[path] = data;
    } else {
        let parts = path.split('.');
        return assign(source[parts[0]], parts.slice(1).join('.'), data);
    }
}

function pathsFor(path) {
    return path
      .split('.')
      .map((part, i, paths) => paths.slice(0, i + 1).join('.'));
}

function crawl(source, callback, path = null) {
    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            let value = source[key];
            let valuePath = path ? [path, key].join('.') : key;
            callback(valuePath, value);
            if (typeof value === 'object') {
                crawl(value, callback, valuePath);
            }
        }
    }
}

export { extend, mix, retrieve, assign, pathsFor, crawl };