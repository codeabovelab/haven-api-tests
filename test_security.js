function test() {
    var api = include("app_api");
    const nameCluster = "SC-test-cluster";
    const nameUserAdmin = "TestAdmin";
    const nameUserOne = "TestUserOne";
    const nameUserTwo = "TestUserTwo";

    function clear() {
        console.debug("Clean...");
        //[nameUserOne, nameUserAdmin, nameUserTwo].forEach(api.userDelete);
        api.clusterDelete(nameCluster);
    }


    api.host = process.env.API_HOST;
    console.debug("api.host:", api.host);
    api.login("admin", "password");

    clear();

    //login

    //api.userCreate(nameUserAdmin);
    // grant admin rights

    //logout

    //login as nameUserAdmin
    //check that

    //create cluster

    //api.userCreate(nameUserOne);
    // grant ACL on cluster to userOne

    //api.userCreate(nameUserTwo);
    // none to grant

    //logout

    //login as userOne, userTwo
    //check access

    clear();
}
