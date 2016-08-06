'use strict';

let crypto = require('crypto'),
    utils = require('../js/lib/utils');

function Temporary() {

    let tempNamespace = "qaa-x-",
        sha1 = crypto.createHash('sha1');

    return {

        newCode: function() {
            return utils.getDeviceId()
                .then(function(deviceId) {
                    let stamp = deviceId + Date.now().toString(),
                        hash = sha1.update(stamp).digest('hex');

                    return tempNamespace + hash.substring(0, 6);
                });
        }

    };

}

module.exports = Temporary();
