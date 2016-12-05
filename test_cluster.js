var api = include("app_api");
function test() {
    const nameTest = "TEST-CLUSTER";

    function clusterMap() {
        return api.clustersList()
                .reduce(function(prev, curr) {prev[curr.name] = curr; return prev;}, {});
    }

    function clusterGet(cluster) {
        var clusters = clusterMap();
        var tmp = clusters[cluster];
        console.debug("Load cluster", cluster, ": ", tmp);
        return tmp;
    }

    function clusterCreate(cluster, data) {
        var clusters = clusterMap();
        var ourCluster =  clusters[cluster];
        console.assert(!clusters[cluster], "Cluster with ", cluster, " already exists!");
        api.clusterCreate(cluster, data);
    }

    function clear() {
        api.clusterDelete(nameTest);
    }

    function testCreate() {
        var ourClusterName = nameTest;
        var ourClusterTitle = "TEST TITLE";

        clusterCreate(ourClusterName, {title: ourClusterTitle});

        var ourCluster = clusterGet(ourClusterName);
        console.assert(!!ourCluster, "Cluster with ", ourClusterName, " is not exists!");
        console.assert(ourCluster.title === ourClusterTitle, "Cluster with ", ourClusterName,
            " has unexpected title: ", ourCluster.title);

        api.clusterDelete(ourClusterName);

    }

    function testCreateWithBadName() {
        var ourClusterName = "TEST_CLUSTER"

        clusterCreate(ourClusterName);

        var cluster = clusterGet(ourClusterName);
        console.assert(!cluster, "Cluster with bad name: ", ourClusterName, " is created!");
    }

    api.host = process.env.API_HOST;
    console.debug("api.host:", api.host);
    api.login("admin", "password");

    clear();
    testCreateWithBadName();
    testCreate();
}
