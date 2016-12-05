function test() {
    const api = include("app_api");
    const assert = include("utils").assert;
    const nameCluster = "SC-test-cluster";
    const defaultClusters = ["all","orphans"];
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
    const userBad = {
        user: "TestBadUser",
        title: "Bad user",
        password: "0000",
        tenant: "root"
    };
    var tokenAdmin;

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

    function userUpdate(user) {
        var name = user.user;
        console.debug("Create user:", name);
        var tmp = clone(user);
        delete tmp.user; //server must create name
        var res = api.userUpdate(name, tmp);
        console.assert(res.code == 200, "Can not create user due error: ", res);
        var loaded = api.user(name).data;
        userCompare(tmp, loaded);
    }

    function aclSetFor(user) {
        return api.acl("CLUSTER/" + nameCluster, {
            "entries": [
                {
                    "id":"1",
                    "sid": {
                        "type": "PRINCIPAL",
                        "principal": user.user,
                        "tenant": user.tenant
                    },
                    "granting": true,
                    "permission": "CRUDEA"
                }
            ]
        })
    }

    function userTests(user) {
        console.debug("Test unprivileged access to user creation");
        var res = api.userUpdate(userBad.user, userBad);
        console.assert(res.code >= 400, "User is unexpectedly created: ", res);
        var tmpToken = api.token;
        api.token = tokenAdmin;
        try {
            var res = api.user(userBad.user);
            console.assert(res.code == 404, "User is unexpectedly found: ", res);
        } finally {
            api.token = tmpToken;
        }

        console.debug("Test unprivileged access to acl modification");
        var res = aclSetFor(userOne);
        console.assert(res.code == 500, "Acl is modified: ", res);

        {
            console.debug("Do allowed own modification");
            var name = user.user;
            console.debug("Modify self:", name);
            var tmp = clone(user);
            delete tmp.user; //server must create name
            tmp.email = "updated" + user.email;
            tmp.title = "updated" + user.title;
            var res = api.userUpdate(name, tmp);
            console.assert(res.code == 200, "Can not create user due error: ", res);
            res = api.userCurrent();
            console.assert(res.code == 200, "Can not load self due error: ", res);
            var loaded = res.data;
            userCompare(tmp, loaded);
        }

        {
            console.debug("Try to do disallowed own modification");
            var name = user.user;
            console.debug("Modify self for admin role:", name);
            var tmp = clone(user);
            tmp.roles = [userAdmin.roles[0]];
            var res = api.userUpdate(name, tmp);
            console.assert(res.code >= 400, "User unexpectedly modified: ", res);
            var loaded = api.userCurrent().data;
            console.assert(loaded.roles.length == 0, "User unexpectedly modified: ", res);
        }
    }

    function userLogin(user) {
        if(user == "admin") {
            api.token = tokeAdmin;
        } else {
            api.login(user.user, user.password);
        }
        var res = api.userCurrent().data;
        userCompare(user, res);
    }


    api.host = process.env.API_HOST;
    console.debug("api.host:", api.host);
    //login
    var tokenAdmin = api.login("admin", "password");

    clear();

    //Create admin
    userUpdate(userAdmin);

    //logout
    api.logout();

    //login as userAdminName
    userLogin(userAdmin);

    //create cluster by new admin
    api.clusterCreate(nameCluster);

    userUpdate(userOne);
    // grant ACL on cluster to userOne
    var res = aclSetFor(userOne);
    console.assert(res.code === 200, "Can not update acl");

    //test delete
    userDelete(userOne.user);
    //create again
    userUpdate(userOne);
    // acl for this user must be remained

    userUpdate(userTwo);
    // none to grant

    //logout
    api.logout();

    //login as userOne,
    userLogin(userOne);
    //check access
    {
        console.debug("Check access for", userOne.user)
        var clusters = api.clustersMap();
        var clusterNames = Object.keys(clusters);
        console.assert(clusterNames.length == (defaultClusters.length + 1) && clusterNames.indexOf(nameCluster) >= 0,
            "User ", userOne.user, "has invalid access to clusters:", clusterNames);

        userTests(userOne);
    }
    api.logout();


    //login as userTwo
    userLogin(userTwo);
    //check access
    {
        console.debug("Check access for", userTwo.user)
        var clusters = api.clustersMap();
        var clusterNames = Object.keys(clusters);
        console.assert(clusterNames.length == defaultClusters.length, "User ", userTwo.user,
            "has invalid access to clusters:", clusterNames);

        userTests(userTwo);
    }
    api.logout();

    clear();
}
