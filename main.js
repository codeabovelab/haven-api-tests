var api = include("app_api");
function test() {
   api.host = "http://localhost:8761/";
   var token = api.login("admin", "password");
   console.debug("token:", token);
   console.debug("list:", api.list(token));
}
