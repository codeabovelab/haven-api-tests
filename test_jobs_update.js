var api = include("app_api");
function test() {
    api.host = process.env.API_HOST;
    var clusterName = "job-test-cluster";

    console.debug("api.host:", api.host);
    api.login("admin", "password");

    //clean
    api.clusterDelete(clusterName);
    api.clusterCreate(clusterName, {title: "cluster for test updates"});

    var params = {
        type: "ui.updateContainers.stopThenStartEach",
        title: "Update test Title",
        parameters: {
            cluster: clusterName,
            "LoadContainersOfImage.percentage": 100,
            images: {
                images: [
                    {
                        name: "*",
                        from: "*",
                        to: "latest"
                    }
                ]
            },
            random: new Date().getTime()
        }
    }

    // note that cluster now does not has any nodes because update do nothing,
    // but we test job instantiation an parameters deserialization
    var res = api.jobCreate(params);
    console.assert(res.code == 200, "JOB: can not be scheduled");
    var job = res.data;
    console.debug("After run:", job);
    if(job.status === 'COMPLETED') {
        return;
    }
    var jobId = job.id;
    //do something with below ugly thing
    java.lang.Thread.sleep(3000);
    var job = api.job(jobId).data
    console.debug("Later:", job);
    if(job.status === 'FAILED_JOB') {
        var log = api.jobLog(jobId).data;
        var latest = log[log.length - 1];
        console.debug("Message of latest record of log:", latest.message);
        console.assert(false, "Test failed");
    }
}
