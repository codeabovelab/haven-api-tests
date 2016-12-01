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
    api.token = null;
    api.login = function(name, password) {
         var request = {
            url: api.host + "/api/token/login",
            data: { username:name, password:password }
        };
        var resp = http.execute(request);
        return api.token = resp.data.key;
    };
    api.list = function() {
        var request = {
            url: api.host + "/api/list"
        };
        reqInterceptor(request);
        var resp = http.execute(request);
        return resp.data;
    };
    return api;
}
