// Put this in the questionnaire.html element

'use strict';


let path = require('path'),
    _ = require('lodash'),
    sanitizer = require('sanitizer'),
    uuid = require('node-uuid'),
    temp = require('./temporary'),
    utils = require('./lib/utils');


function Questionnaire(configurator, languageSlug) {
    
    languageSlug = languageSlug || 'en';

    let data = require('../config/questionnaire.json'),
        questionnaire = _.find(data.languages, {'slug': languageSlug}) || _.find(data.languages, {'slug': 'en'});

    // NOTE: What should we do if there's still no questionnaire at this point?

    function groupQuestions(questions) {
        // Group by 'depends_on' property
        let temp = _.reduce(questions, function(arr, question) {
            if (question.depends_on === null) {
                arr.push([question]);
            } else {
                arr[arr.length - 1].push(question);
            }
            return arr;
        }, []);
        // Combine adjacent stand-alone questions in groups of three or less
        return _.reduce(temp, function(arr, group, index) {
            let prevGroup = index > 0 ? arr[arr.length -1] : null,
                isAlone = group.length === 1,
                prevHasRoom = prevGroup !== null && prevGroup.length < 3;

            if (isAlone && prevHasRoom) {
                prevGroup.push(group[0]);
            } else {
                arr.push(group);
            }

            return arr;
        }, []);
    }

    return {

        // Return an array of question objects
        get questions() {
            return questionnaire ? groupQuestions(questionnaire.questions) : undefined;
        },

        // Return the loaded questionnaire id
        get id() {
            return questionnaire ? questionnaire['questionnaire_id'] : undefined;
        },

        // Return the data_fields/language_data object from the questionnaire
        get dataFields() {
            // return questionnaire && questionnaire['data-fields'];
            return questionnaire ? questionnaire['language_data'] : undefined;
        },

        // Clean answers. Checkout https://github.com/theSmaw/Caja-HTML-Sanitizer/blob/master/test/test-sanitizer.js
        // for more info on what it does.
        sanitize: function(answersObj) {
            _.forIn(answersObj, function(value, key) {
                value = sanitizer.sanitize(value);
            });
            return answersObj;
        },

        // Save user's answer and some other metadata as a file to be pushed later
        save: function(user, answersObj) {
            let _this = this,
                dirPath = configurator.getUserPath('datalocation', 'new_languages'),
                ext = '.json',
                date = new Date(),
                timeStamp = date.getFullYear().toString() +
                    App.utils.padZero(date.getMonth() + 1) +
                    App.utils.padZero(date.getDate()) +
                    App.utils.padZero(date.getHours()) +
                    App.utils.padZero(date.getMinutes()) +
                    App.utils.padZero(date.getSeconds());

            return temp.newCode()
                .then(function(tempCode) {
                    return {
                        request_id: uuid.v1(),
                        temp_code: tempCode,
                        data_fields: _this.dataFields,
                        questionnaire_id: _this.id,
                        app: 'ts-desktop',
                        requester: user,
                        submitted_at: timeStamp,
                        answers: _.map(answersObj, function(answer, key) {
                            return {question_id: key, text: answer};
                        })
                    };
                })
                .then(function(data) {
                    return utils.fs.mkdirs(dirPath).then(function() {
                        return data;
                    });
                })
                .then(function(data) {
                    let filePath = path.join(dirPath, data.temp_code + ext),
                        toBeWritten = JSON.stringify(data, null, 2);
                        
                    return utils.fs.writeFile(filePath, toBeWritten).then(function() {
                        return {
                            id: data.temp_code,
                            name: data.answers[data.data_fields['ln']].text
                        };
                    });
                });
        },

        // Submit questionnaire/answers file to door43 and tD
        submit: function() {
            throw 'Not implemented';
        },

        // Maybe don't need this? Updating is handled through the update/sync
        update: function() {
            throw 'Not implemented';
        },


    };

}

module.exports.Questionnaire = Questionnaire;