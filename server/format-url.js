module.exports = function(path, params) {
    if (!params) return path;

    for (var param in params) {
        if (!params.hasOwnProperty(param)) continue;
        path = path.replace(new RegExp(':' + param + '([\\?]*)', 'gi'), params[param]);
    }

    // Removes any optional parameters (:name?, :name?/)
    path = path.replace(/(:)[^\/]*(\?)(\/*)/g, '');

    // Remove trailing slash
    path = path.replace(/(\/+)$/, '');

    return path;
};