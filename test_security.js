function test() {
    const api = include("app_api");
    const assert = include("utils").assert;
    const nameCluster = "SC-test-cluster";
    const userAdmin = {
        user: "TestAdmin",
        title: "Cluster admin",
        password: "7s,49dh3k9mq.0",
        tenant: "root",
        roles: [
            {name: "ROLE_ADMIN", tenant: "root"}
        ]
    };
    const userOne = {
        user: "TestUserOne",
        title: "Cluster user",
        password: "_-_-_-_",
        tenant: "root"
    };
    const userTwo = {
        user: "TestUserTwo",
        title: "Unprivileged user",
        password: "2",
        tenant: "root"
    };

    function clear() {
        console.debug("Clean...");
        if(!api.token) {
            api.login("admin", "password");
        }
        [userOne.user, userAdmin.user, userTwo.user].forEach(api.userDelete);
        api.clusterDelete(nameCluster);
    }

    function userCompare(expected, actual) {
        var name = expected.user || actual && actual.user;
        assert.equal(expected, actual, {
            message: "User '" + name + "' is not same:\n",
            skip:["password"]
        });
    }

    function userDelete(name) {
        console.debug("Delete user:", name);
        var res = api.userDelete(name);
        console.assert(res.code == 200, "Can not delete user:", name, "due to error:", res.message);
    }

    function userCreate(user) {
        var name = user.user;
        console.debug("Create user:", name);
        var tmp = clone(user);
        delete tmp.user; //server must create name
        var res = api.userCreate(name, tmp);
        console.assert(res.code == 200, "Can not create user due error: ", res);
        var user = api.user(name).data;
        userCompare(tmp, user);
    }

    function userLogin(user) {
        api.login(user.user, user.password);
        var res = api.userCurrent().data;
        userCompare(user, res);
    }


    api.host = process.env.API_HOST;
    console.debug("api.host:", api.host);
    //login
    api.login("admin", "password");

    clear();

    //Create admin
    userCreate(userAdmin);

    //logout
    api.logout();

    //login as userAdminName
    userLogin(userAdmin);

    //create cluster by new admin
    api.clusterCreate(nameCluster);

    userCreate(userOne);
    // grant ACL on cluster to userOne

    //test delete
    userDelete(userOne.user);
    //create again
    userCreate(userOne);

    userCreate(userTwo);
    // none to grant

    //logout
    api.logout();

    //login as userOne,
    userLogin(userOne);

    //check access
    api.logout();


    //login as userTwo
    userLogin(userTwo);
    //check access
    api.logout();

    clear();
}
