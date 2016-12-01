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
    api.token = null;
    api.login = function(name, password) {
         var request = {
            url: api.host + "/ui/token/login",
            data: { username:name, password:password }
        };
        var resp = http.execute(request);
        console.debug(" * Login with token: ", JSON.stringify(resp));
        return api.token = resp.data.key;
    };
    api.list = function() {
        var request = {
            url: url("users-current")
        };
        reqInterceptor(request);
        var resp = http.execute(request);
        return resp.data;
    };
    return api;
}
