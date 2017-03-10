function () {
/*
Usage:
    const assert = include("utils").assert;
    assert.equal(expected, actual, {
                message: "User '" + name + "' is not same:\n",
                skip:["password"]
            });
*/
    function compare(left, right, args) {
        if(args === undefined) {
            args = {};
        }
        var errors = [];
        var visited = [];
        function compareObjects(path, left, right) {
            if(left === null || right === null ||
               typeof left !== 'object' || typeof right !== 'object') {
                if(left !== right) {
                    errors.push("different '" + path + "': expected=" + left
                    + " but actual=" + right);
                }
                return;
            }
            if(visited.indexOf(left) >= 0) {
                return;
            }
            visited.push(left);

            var keys = Object.keys(left);
            if(args.skip) {
                var skip = args.skip;
                var filter;
                if(typeof skip === 'function') {
                    filter = function(i) { return !skip(path + i) };
                } else if(skip instanceof Array) {
                    filter = function(i) { return skip.indexOf(path + i) < 0 };
                }
                if(filter) {
                    keys = keys.filter(filter);
                }
            }
            const isArray = left instanceof Array;
            for(var i = 0; i < keys.length; ++i) {
                var key = keys[i];
                var expected = left[key];
                var actual = right[key];
                var prefix = path + (isArray? "[" + key + "]" : "." + key);
                compareObjects(prefix, expected, actual);
            }
        }
        compareObjects("", left, right);
        if(errors.length > 0) {
            console.assert(false, args.message || "", errors.join('\n'));
        }
    };
    var utils = {assert:{}};
    utils.assert.equal = compare;
    Object.freeze(utils);
    return utils;
}
