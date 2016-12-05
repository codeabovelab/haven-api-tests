function () {
    function compare(left, right, args) {
        if(args === undefined) {
            args = {};
        }
        var errors = [];
        var visited = [];
        function simpleCompare(path, left, right) {
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
                if(typeof expected === 'object' && typeof actual === 'object') {
                    var prefix = key;
                    if(isArray) {
                        prefix = path + "[" + key + "]";
                    } else if(path) {
                        prefix = path + "." + key;
                    }
                    simpleCompare(prefix, expected, actual);
                } else if(expected !== actual) {
                    errors.push("different '" + key + "': expected=" + expected
                    + " but actual=" + actual);
                }
            }
        }
        simpleCompare("", left, right, args);
        if(errors.length > 0) {
            console.assert(false, args.message || "", errors.join('\n'));
        }
    };
    var utils = {assert:{}};
    utils.assert.equal = compare;
    return utils;
}
