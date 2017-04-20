var builder = require('botbuilder');

var PhoneRegex = new RegExp(/^01\d{8,9}$$/);       // Format = 01xxxxxxxxx
var EmailRegex = new RegExp(/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);

var lib = new builder.Library('validators');

lib.dialog('notes',
    builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
        return response && response.length <= 200;
    }));

lib.dialog('phonenumber',
    builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
        return PhoneRegex.test(response);
    }));

lib.dialog('email',
    builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
        return EmailRegex.test(response);
    }));

// Export createLibrary() function
module.exports.createLibrary = function () {
    return lib.clone();
};

module.exports.PhoneRegex = PhoneRegex;
module.exports.EmailRegex = EmailRegex;