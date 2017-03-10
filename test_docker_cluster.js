var api = include("app_api");
function test() {
    const nameTest = "TEST-CLUSTER";
    const managerNode = "docker-exp";

    function clusterGet(cluster) {
        var clusters = api.clustersMap();
        var tmp = clusters[cluster];
        console.debug("Load cluster", cluster, ": ", tmp);
        return tmp;
    }

    function clusterCreate(cluster, data) {
        console.debug("Check that", cluster, "not exists.");
        var clusters = api.clustersMap();
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

        clusterCreate(ourClusterName, {
            type: "DOCKER",
            title: ourClusterTitle,
            managers: [managerNode]
        });

        console.debug("Check that", ourClusterName, "is exists");
        var ourCluster = clusterGet(ourClusterName);
        console.assert(!!ourCluster, "Cluster with ", ourClusterName, " is not exists!");
        console.assert(ourCluster.title === ourClusterTitle, "Cluster with ", ourClusterName,
            " has unexpected title: ", ourCluster.title);

        console.debug("Delete", ourClusterName);
        api.clusterDelete(ourClusterName);

    }

    api.host = process.env.API_HOST;
    console.debug("api.host:", api.host);
    api.login("admin", "password");

    clear();
    testCreate();
}
