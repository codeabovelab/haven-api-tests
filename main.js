var api = include("app_api");
function test() {
    api.host = process.env.API_HOST;
    console.debug("api.host:", api.host);
    var token = api.login("admin", "password");
    var clusters = api.clustersList().data;
    var clusterNames = clusters.map(function(c) {return c.name;});
    console.debug("clusters:", clusterNames);
    for(var i = 0; i  < clusterNames.length; ++i) {
        var clusterName = clusterNames[i];
        var clusterNodes = api.clusterNodesDetailed(clusterName);
        console.debug("nodes for ", clusterName, ": ", clusterNodes);
    }
}
