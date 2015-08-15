/**
 * ts.Configurator
 * settings manager that uses local storage by default, but can be overridden to use any storage provider.
 * Configurations are stored by key as stringified JSON (meta includes type, mutability, etc)
 */

var unionObjects = require('./lib/util').unionObjects;

 ;(function () {
    'use strict';

    function Configurator () {
        var storage = {};

        var getValue = function (key) {
            if (key === undefined) {
                return key;
            }
            key = key.toLowerCase();

            var valueObjStr = storage[key] || '{}';
            var valueObj = JSON.parse(valueObjStr);
            var metaObj = valueObj.meta || {'default': ''};

            //load value
            var value = valueObj.value;

            //otherwise use default (if present)
            if (value === undefined && metaObj.default) {
                value = metaObj.default;
            }

            return value;
        };

        var getMetaValue = function (key, metaKey) {
            if (key === undefined) {
                return key;
            }
            key = key.toLowerCase();

            var valueObjStr = storage[key] || '{}';
            var valueObj = JSON.parse(valueObjStr);

            return valueObj.meta ? valueObj.meta[metaKey] : '';
        };

        var setValue = function (key, value, meta) {
            if (key === undefined || value === undefined) {
                return;
            }
            key = key.toLowerCase();
            value = typeof value === 'boolean' || typeof value === 'number' ? value : value.toString();

            //return if read-only
            var mutable = getMetaValue(key, 'mutable');
            if (mutable !== undefined && mutable === false) {
                return;
            }

            //load value object or create new empty value object
            var emptyStorageObj = {'value': value, 'meta': {'mutable': true, 'type': typeof value, 'default': ''}};
            var valueObj = storage[key] !== undefined ? JSON.parse(storage[key]) : emptyStorageObj;

            //update value
            valueObj.value = value;

            //update meta
            valueObj.meta = unionObjects(valueObj.meta, meta);

            //update value in storage
            storage[key] = JSON.stringify(valueObj);
        };

        var unsetValue = function (key) {
            if (key === undefined) {
                return;
            }
            key = key.toLowerCase();

            //return if read-only
            var mutable = getMetaValue(key, 'mutable');
            if (mutable === false) {
                return;
            }

            //remove value from storage
            if (typeof storage.removeItem === 'function') {
                storage.removeItem(key);
            } else {
                storage[key] = undefined;
            }
        };

        var setReadOnlyValue = function (key, value) {
            setValue(key, value, {'mutable': false});
        };

        var setDefaultValue = function (key, value) {
            setValue(key, value, {'default': value});
        };

        var getKeys = function () {
            return Object.keys(storage);
        };

        var configurator = {
            setStorage: function (storeObject) {
                storage = storeObject;
            },

            /**
             * Retreives a value
             * @param key
             * @returns {object}
             */
            getValue: function (key) {
                var value = getValue(key);
                if (value === undefined) {
                    return '';
                }

                return value;
            },

            /**
             * Adds a new value to the configurator
             * @param key the key used to retreive the value
             * @param value the value that will be stored
             * @param meta optional parameters to help specify how the value should be treated
             */
            setValue: function (key, value, meta) {
                setValue(key, value, meta);
            },

            /**
             * Loads a configuration object into the configurator
             * @param config a json object (usually loaded from a file)
             */
            loadConfig: function (config) {
                if (storage === undefined) {
                    throw 'Storage is undefined. Please call setStorage with a valid storage object';
                }

                for (var i = 0; i < config.length; i++) {
                    if (config[i].value !== undefined) {
                        if (config[i].meta.mutable) {
                            setDefaultValue(config[i].name, config[i].value);
                        } else {
                            setReadOnlyValue(config[i].name, config[i].value);
                        }
                    }
                }
            },

            /**
             * Destroys a value
             * @param key
             */
            unsetValue: function (key) {
                unsetValue(key);
            },

            /**
             * Clears all values in the configurator
             */
            purgeValues: function () {
                var keys = getKeys();
                for (var i = 0; i < keys.length; i++) {
                    unsetValue(keys[i]);
                }
            }
        };

        return configurator;
    }

    //exports.setStorage = configurator.setStorage;
    //exports.getValue = configurator.getValue;
    //exports.setValue = configurator.setValue;
    //exports.unsetValue = configurator.unsetValue;
    //exports.loadConfig = configurator.loadConfig;
    //exports.purgeValues = configurator.purgeValues;
    //
    exports.Configurator = Configurator;
})();
