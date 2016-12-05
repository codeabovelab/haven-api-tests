var api = include("app_api");
function test() {
    function clusterMap() {
        return api.clustersList()
                .reduce(function(prev, curr) {prev[curr.name] = curr; return prev;}, {});
    }

    api.host = process.env.API_HOST;
    console.debug("api.host:", api.host);
    var token = api.login("admin", "password");

    function clusterCreate(cluster, data) {
        var clusters = clusterMap();
        var ourCluster =  clusters[cluster];
        console.assert(!clusters[cluster], "Cluster with ", cluster, " already exists!");
        api.clusterCreate(cluster, data);
    }


    function testCreate() {
        var ourClusterName = "TEST-CLUSTER"
        var ourClusterTitle = "TEST TITLE"

        clusterCreate(ourClusterName, {title: ourClusterTitle});

        var clusters = clusterMap();
        var ourCluster =  clusters[ourClusterName];
        console.debug("Our cluster: ", ourCluster);
        console.assert(!!ourCluster, "Cluster with ", ourClusterName, " is not exists!");
        console.assert(ourCluster.title === ourClusterTitle, "Cluster with ", ourClusterName,
            " has unexpected title: ", ourCluster.title);
    }

    function testCreateWithBadName() {
        var ourClusterName = "TEST_CLUSTER"

        clusterCreate(ourClusterName);

        var clusters = clusterMap();
        var ourCluster =  clusters[ourClusterName];
        console.debug("Our cluster: ", ourCluster);
        console.assert(!ourCluster, "Cluster with bad name: ", ourClusterName, " is created!");
    }

    testCreateWithBadName();
    //testCreate();
}
