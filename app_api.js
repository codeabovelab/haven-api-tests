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
        request.onResponse = function (req, resp) {
            if(resp.code < 400) {
                return;
            }
            // we change resp.message for usage in outer code
            if(!resp.message && resp.data && resp.data.message) {
                resp.message = resp.data.message;
            }
            console.error(req.method, req.url, "return error:", resp.code, resp.message);
        };
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
            return http.execute(request);
        };
    }
    api.token = null;
    api.login = function(name, password) {
         var request = {
            url: api.host + "/ui/token/login",
            data: { username:name, password:password }
        };
        var resp = http.execute(request);
        console.debug("Login as", resp.data.userName, "with token: ", resp.data.key);
        return api.token = resp.data.key;
    };
    api.logout = function() {
        api.token = null;
    };
    api.clustersList = make("GET", function(r) {r.url = url("clusters/")});
    api.clusterNodesDetailed = make("GET", function (r, cluster) {r.url = url("clusters/" + cluster + "/nodes-detailed");});
    api.clusterCreate = make("PUT", function(r, cluster, data) {
        r.url = url("clusters/" + cluster);
        r.data = data;
    });
    api.clusterDelete = make("DELETE", function(r, cluster) {r.url = url("clusters/" + cluster)});
    api.user = make("GET", function(r, user) {r.url = url("users/" + user)});
    api.userCurrent = make("GET", function(r, user) {r.url = url("users-current")});
    api.userCreate = make("POST", function(r, user, data) {
        r.url = url("users/" + user);
        r.data = data;
    });
    api.userDelete = make("DELETE", function(r, user) {r.url = url("users/" + user)});
    return api;
}
