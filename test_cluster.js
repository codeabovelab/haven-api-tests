var api = include("app_api");
function test() {
    const nameTest = "TEST-CLUSTER";

    function clusterMap() {
        return api.clustersList().data
                .reduce(function(prev, curr) {prev[curr.name] = curr; return prev;}, {});
    }

    function clusterGet(cluster) {
        var clusters = clusterMap();
        var tmp = clusters[cluster];
        console.debug("Load cluster", cluster, ": ", tmp);
        return tmp;
    }

    function clusterCreate(cluster, data) {
        console.debug("Check that" + cluster + "not exists.");
        var clusters = clusterMap();
        var ourCluster =  clusters[cluster];
        console.assert(!clusters[cluster], "Cluster with ", cluster, " already exists!");
        console.debug("Create cluster:", cluster);
        api.clusterCreate(cluster, data);
    }

    function clear() {
        console.debug("Clean...");
        api.clusterDelete(nameTest);
    }

    function testCreate() {
        var ourClusterName = nameTest;
        var ourClusterTitle = "TEST TITLE";

        clusterCreate(ourClusterName, {title: ourClusterTitle});

        console.debug("Check that", ourClusterName, "is exists");
        var ourCluster = clusterGet(ourClusterName);
        console.assert(!!ourCluster, "Cluster with ", ourClusterName, " is not exists!");
        console.assert(ourCluster.title === ourClusterTitle, "Cluster with ", ourClusterName,
            " has unexpected title: ", ourCluster.title);

        console.debug("Delete", ourClusterName);
        api.clusterDelete(ourClusterName);

    }

    function testCreateWithBadName() {
        var ourClusterName = "TEST_CLUSTER"

        clusterCreate(ourClusterName);

        console.debug("Check that", ourClusterName, "is not exists");
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
