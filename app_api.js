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
        var host = api.host;
        if(host[host.length - 1] == '/') {
            host = host.substring(0, host.length - 1);
        }
        return host + "/ui/api/" + suffix;
    }
    function make(method, req) {
        return function () {
            var request = {
                method: method,
            };
            var args = Array.prototype.concat.apply([request], arguments);
            req.apply(this, args);
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
    api.clustersList = make("GET", function(r){r.url = url("clusters/")});
    api.clusterNodesDetailed = make("GET", function (r, cluster) {r.url = url("clusters/" + cluster + "/nodes-detailed");});
    api.clusterCreate = make("PUT", function(r, cluster, data) {
        r.url = url("clusters/" + cluster);
        r.data = data;
    });
    api.clusterDelete = make("DELETE", function(r, cluster) {r.url = url("clusters/" + cluster)});
    return api;
}
