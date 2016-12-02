function () {
    var api = {};
    function reqInterceptor(request) {
        if(!api.token) {
            return;
        }
        if(!request.headers) {
            request.headers = {};
        }
        request.headers["X-Auth-Token"] = api.token;
    }
    function url(suffix) {
        return api.host + "/ui/api/" + suffix;
    }
    function makeGet(urlSrc) {
        return function () {
            var suffix;
            if(typeof urlSrc === 'function') {
                suffix = urlSrc.apply(this, arguments);
            } else {
                suffix = urlSrc;
            }
            var request = {
                url: url(suffix)
            };
            reqInterceptor(request);
            var resp = http.execute(request);
            return resp.data;
        };
    }
    api.token = null;
    api.login = function(name, password) {
         var request = {
            url: api.host + "/ui/token/login",
            data: { username:name, password:password }
        };
        var resp = http.execute(request);
        console.debug(" * Login with token: ", resp.data.key);
        return api.token = resp.data.key;
    };
    api.clustersList = makeGet("clusters/");
    api.clusterNodesDetailed = makeGet(function (cluster) {return "clusters/" + cluster + "/nodes-detailed";});
    return api;
}
