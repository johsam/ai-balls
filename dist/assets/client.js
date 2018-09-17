(function() {
    var status = document.getElementById('status');
    var info = document.getElementById('info');

    // wrap testbed with ui
    var _testbed = planck.testbed;
    planck.testbed = function(opts, callback) {
        _testbed(opts, function(testbed) {
            status.innerText = '';
            info.innerText = '';

            var _lastStatus = '';
            var _lastInfo = '';

            testbed._status = function(statusText, statusMap) {
                var newline = '\n';
                var string = statusText || '';
                for (var key in statusMap) {
                    var value = statusMap[key];
                    if (typeof value === 'function') continue;
                    string += (string && newline) + key + ': ' + value;
                }

                if (_lastStatus !== string) {
                    status.innerText = _lastStatus = string;
                }
            };

            testbed._info = function(text) {
                if (_lastInfo !== text) {
                    info.innerText = _lastInfo = text;
                }
            };

            var world = callback(...arguments);

            testbed.resume();

            return world;
        });
    };
}());
