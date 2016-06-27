// Put this in the questionnaire.html element

'use strict';


let _ = require('lodash');


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

        // Save user's answer and some other metadata as a file to be pushed later
        save: function() {
            throw 'Not implemented';
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