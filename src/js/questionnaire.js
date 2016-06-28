// Put this in the questionnaire.html element

'use strict';


let _ = require('lodash'),
    sanitizer = require('sanitizer'),
    uuid = require('node-uuid'),
    temp = require('./temporary'),
    utils = require('./lib/utils');


function Questionnaire(languageSlug) {
    
    languageSlug = languageSlug || 'en';

    let data = require('../config/questionnaire.json'),
        questionnaire = _.find(data.languages, {'slug': languageSlug}) || _.find(data.languages, {'slug': 'en'});

    // NOTE: What should we do if there's still no questionnaire at this point?

    function groupQuestions(questions) {
        return _.reduce(questions, function(acc, question) {
            question.depends_on === null ? acc.push([question]) : acc[acc.length - 1].push(question);
            return acc;
        }, []);
    }

    return {

        // Return an array of question objects
        get questions() {
            return questionnaire && groupQuestions(questionnaire.questions);
        },

        // Return the loaded questionnaire id
        get id() {
            console.log('in id', questionnaire);
            return questionnaire && questionnaire['questionnaire_id'];
        },

        // Return the data_fields/language_data object from the questionnaire
        get dataFields() {
            console.log('in dataFields', questionnaire);
            // return questionnaire && questionnaire['data-fields'];
            return questionnaire && questionnaire['language_data'];
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
        save: function(answersObj) {
            let _this = this;
            temp.newCode()
                .then(function(tempCode) {
                    return {
                        request_id: uuid.v1(),
                        temp_code: tempCode,
                        data_fields: _this.dataFields,
                        questionnaire_id: _this.id,
                        app: 'ts-desktop',
                        requester: '',
                        submitted_at: Date.now(),
                        answers: _.map(answersObj, function(answer, key) {
                            return {question_id: key, text: answer};
                        })
                    };
                })
                .then(utils.log);
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