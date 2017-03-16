function () {
    var api = {};
    function reqInterceptor(request) {
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
            return http.execute(request);
        };
    }
    api.token = null;
    api.login = function(name, password) {
         var request = {
            url: api.host + "/ui/token/login",
            data: { username:name, password:password }
        };
        reqInterceptor(request);
        var resp = http.execute(request);
        console.assert(resp.code < 400, "Can not login, see above log.");
        console.debug("Login as", resp.data.userName, "with token: ", resp.data.key);
        return api.token = resp.data.key;
    };
    api.logout = function() {
        api.token = null;
    };
    api.clustersList = make("GET", function(r) {r.url = url("clusters/")});
    api.clustersMap = function clusterMap() {
        return api.clustersList().data
            .reduce(function(prev, curr) {prev[curr.name] = curr; return prev;}, {});
    };
    api.clusterNodesDetailed = make("GET", function (r, cluster) {r.url = url("clusters/" + cluster + "/nodes-detailed");});
    api.clusterCreate = make("PUT", function(r, cluster, data) {
        r.url = url("clusters/" + cluster);
        r.data = data;
    });
    api.clusterDelete = make("DELETE", function(r, cluster) {r.url = url("clusters/" + cluster)});
    api.user = make("GET", function(r, user) {r.url = url("users/" + user)});
    api.userCurrent = make("GET", function(r, user) {r.url = url("users/current/")});
    api.userUpdate = make("POST", function(r, user, data) {
        r.url = url("users/" + user);
        r.data = data;
    });
    api.userDelete = make("DELETE", function(r, user) {r.url = url("users/" + user)});
    api.acl = make("POST", function(r, id, data) {
        r.url = url("acl/" + id);
        r.data = data;
    });
    api.job = make("GET", function(r, job) {r.url = url("jobs/" + job)});
    api.jobLog = make("GET", function(r, job) {r.url = url("jobs/" + job + "/log")});
    api.jobCreate = make("POST", function(r, data) {
        r.url = url("jobs/");
        r.data = data;
    });
    api.jobDelete = make("DELETE", function(r, job) {r.url = url("jobs/" + job)});

    api.serviceCreate = make("POST", function(r, cluster, data) {
        r.url = url("services/create?cluster=" + cluster);
        r.data = data;
    });
    api.serviceUpdate = make("POST", function(r, cluster, id, data) {
        r.url = url("services/update?cluster=" + cluster + "&id=" + id);
        r.data = data;
    });
    api.service = make("GET", function(r, cluster, id) {r.url = url("services/get?cluster=" + cluster + "&id=" + id)});
    api.serviceDelete = make("POST", function(r, cluster, id) {r.url = url("services/delete?cluster=" + cluster + "&id=" + id)});

    api.network = make("GET", function(r, cluster, id) {r.url = url("networks/get?cluster=" + cluster + "&network=" + id)});
    api.networkCreate = make("POST", function(r, cluster, network, data) {
        r.url = url("networks/create?cluster=" + cluster + "&network=" + network);
        r.data = data;
    });
    api.networkDelete = make("DELETE", function(r, cluster, network) {
        r.url = url("networks/delete?cluster=" + cluster + "&network=" + network);
    });
    return api;
}
