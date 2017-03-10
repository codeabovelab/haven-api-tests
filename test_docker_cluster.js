var api = include("app_api");
function test() {
    const clusterName = "TEST-CLUSTER";
    const serviceName = "ping-service";
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
        console.debug("Delete service: ", serviceName);
        api.serviceDelete(clusterName, serviceName);
        console.debug("Delete cluster: ", clusterName);
        api.clusterDelete(clusterName);
    }

    function createCluster() {
        var ourClusterName = clusterName;
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

    }

    api.host = process.env.API_HOST;
    console.debug("api.host:", api.host);
    api.login("admin", "password");

    clear();
    createCluster();
    var serviceSource = JSON.parse(io.load("./docker_cluster/ping-service.json"));
    serviceSource.name = serviceName;
    console.debug("Create service '", serviceName, " with follow sources: ", serviceSource);
    var res = api.serviceCreate(clusterName, serviceSource).data;
    console.debug("Create service result: ", res);
    var createdService = api.service(clusterName, serviceName).data;
    console.debug("Get service result: ", createdService);
    clear();
}
