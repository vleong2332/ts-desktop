/**
 * Created by Emmitt on 7/2/2015.
 */
var assert = require('assert');
var fs = require('fs');

var Reporter = require('../../app/js/reporter').Reporter;
var version = require('../../package.json').version;

var reporterConfigurator = require('../../app/js/configurator');
var reporterDefaultConfig = require('../../app/config/defaults');

;(function () {
    'use strict';

    reporterConfigurator.setStorage({});
    reporterConfigurator.loadConfig(reporterDefaultConfig);
    try {
        var stats = fs.lstatSync('../../app/config/private');

        if (stats.isFile()) {
            var reporterPrivateConfig = require('../../app/config/private');
            reporterConfigurator.loadConfig(reporterPrivateConfig);
        }
    } catch (e) {

    }

    var logPath = 'unit_tests/reporter/log.txt';

    var reporter = new Reporter({
        logPath: logPath,
        oauthToken: reporterConfigurator.getValue('oauthToken'),
        repoOwner: reporterConfigurator.getValue('repoOwner'),
        repo: reporterConfigurator.getValue('repo'),
        maxLogFileKb: reporterConfigurator.getValue('maxLogFileKb'),
        appVersion: version
    });

    describe('@Reporter', function () {
        //careful when editing this file as the expected strings are hardcoded with line numbers
        describe('@logNotice', function () {
            var key = 'This is a test';
            var logFileResults = '';
            var textExpected = '';

            before(function (done) {
                fs.exists(logPath, function () {
                    fs.unlink(logPath, function () {
                        reporter.logNotice(key, function () {
                            var date = new Date();
                            date = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                            //reporter.js:<line>:<column> this will need to be changed if the code changes
                            textExpected = date + ' I/reporter.js:50:3: ' + key + '\n';

                            reporter.stringFromLogFile(null, function (logResults) {
                                logFileResults = logResults;
                                done();
                            });
                        });
                    });
                });
            });
            it('should create a log file notice', function (done) {
                assert.equal(logFileResults, textExpected);
                fs.exists(logPath, function () {
                    fs.unlink(logPath, function () {
                        done();
                    });
                });
            });
        });

        describe('@logWarning', function () {
            var key = 'This is a test';
            var logFileResults = '';
            var textExpected = '';

            before(function (done) {
                fs.exists(logPath, function () {
                    fs.unlink(logPath, function () {
                        reporter.logWarning(key, function () {
                            var date = new Date();
                            date = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                            //reporter.js:<line>:<column> this will need to be changed if the code changes
                            textExpected = date + ' W/reporter.js:82:3: ' + key + '\n';

                            reporter.stringFromLogFile(null, function (logResults) {
                                logFileResults = logResults;
                                done();
                            });
                        });
                    });
                });
            });
            it('should create a log file warning', function (done) {
                assert.equal(logFileResults, textExpected);
                fs.exists(logPath, function () {
                    fs.unlink(logPath, function () {
                        done();
                    });
                });
            });
        });

        describe('@logError', function () {
            var key = 'This is a test';
            var logFileResults = '';
            var textExpected = '';

            before(function (done) {
                fs.exists(logPath, function () {
                    fs.unlink(logPath, function () {
                        reporter.logError(key, function () {
                            var date = new Date();
                            date = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                            //reporter.js:<line>:<column> this will need to be changed if the code changes
                            textExpected = date + ' E/reporter.js:114:3: ' + key + '\n';

                            reporter.stringFromLogFile(null, function (logResults) {
                                logFileResults = logResults;
                                done();
                            });
                        });
                    });
                });
            });
            it('should create a log file error', function (done) {
                assert.equal(logFileResults, textExpected);
                fs.exists(logPath, function () {
                    fs.unlink(logPath, function () {
                        done();
                    });
                });
            });
        });

        /* The tests below are activated by a flag at the top of the code
         * They are disabled by default since they require a bit of configuration
         * with an OAUTH Token and a user/repo name given. They also require an
         * active internet connection
         * */
        describe('@reportBug', function () {
            if (reporter.canReportToGithub()) {
                var title = '[Automated] Bug Report';
                var labels = [version, 'Bug Report'];
                labels.sort(function (a, b) {
                    return a > b;
                });

                var githubResponse = '';

                before(function (done) {
                    reporter.reportBug(title, function (res) {
                        githubResponse = JSON.parse(res);
                        if (githubResponse.message) {
                            assert.fail(false, true, githubResponse.message, '=');
                        }
                        done();
                    });
                });

                describe('@reportBugLabels', function () {
                    it('should compare the labels of the issue', function () {
                        assert.equal(githubResponse.labels.length, labels.length);

                        githubResponse.labels.sort(function (a, b) {
                            return a.name > b.name;
                        });

                        for (var i = 0; i < githubResponse.labels.length; i++) {
                            assert.equal(githubResponse.labels[i].name, labels[i]);
                        }
                    });
                });

                describe('@reportBugTitle', function () {
                    it('should compare the title of the issue', function () {
                        assert.equal(githubResponse.title, title);
                    });
                });
            }
        });

        describe('@reportCrash', function () {
            if (reporter.canReportToGithub()) {
                var title = '[Automated] Crash Report';
                var labels = [version, 'Crash Report'];
                labels.sort(function (a, b) {
                    return a > b;
                });

                var githubResponse = '';

                before(function (done) {
                    reporter.reportCrash(title, null, function (res) {
                        githubResponse = JSON.parse(res);
                        if (githubResponse.message) {
                            assert.fail(false, true, githubResponse.message, '=');
                        }
                        done();
                    });
                });

                describe('@reportCrashLabels', function () {
                    it('should compare the labels of the issue', function () {
                        assert.equal(githubResponse.labels.length, labels.length);

                        githubResponse.labels.sort(function (a, b) {
                            return a.name > b.name;
                        });

                        for (var i = 0; i < githubResponse.labels.length; i++) {
                            assert.equal(githubResponse.labels[i].name, labels[i]);
                        }
                    });
                });

                describe('@reportCrashTitle', function () {
                    it('should compare the title of the issue', function () {
                        assert.equal(githubResponse.title, title);
                    });
                });
            }
        });
    });

})();
