////////////////////////////////////////////////////////////
// Start: To setup the script, Install these packages
// 
// npm install --save botbuilder 
// npm install --save restify
// npm install --save applicationinsights 
// npm install --save dotenv-extended   (RUN AS ADMIN)
// npm install --save node-rest-client
// npm install --save mathjs
//
////////////////////////////////////////////////////////////

require('dotenv-extended').load();

var restify = require('restify');
var builder = require('botbuilder');
var RestClient = require('node-rest-client').Client;
var restclient = new RestClient();
var math = require('mathjs');


// Get secrets from server environment
var botConnectorOptions = { 
    appId: process.env.BOTFRAMEWORK_APPID, 
    appPassword: process.env.BOTFRAMEWORK_APPSECRET
};


// Create bot
var connector = new builder.ChatConnector(botConnectorOptions);
var bot = new builder.UniversalBot(connector, [

    function (session) {
        session.beginDialog('menu');
    },

    function (session, results) {
        session.endConversation("Please type Menu");
    }
]);

// Validators
bot.library(require('./validators').createLibrary());

////////////////////////////////////////////////////////////////////////////
// Global Variables
var MaxRetries = 2; 
var DefaultErrorPrompt = "Sorry, I don't really Understand. Can you repeat?"



// Send welcome when conversation with bot is started, by initiating the root dialog
bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, 'menu');
            }
        });
    }
});


// R - menu
bot.dialog('menu', [
    function (session) {
        
        session.send("Hello, I'm your friendly Digi beta bot and I'll be available from 9pm-12am");
        builder.Prompts.choice(session, "To get started, these are the things I can help you with. Just click on any of the below and let's get started.", 'Prepaid|Postpaid|Broadband|Roaming|Commonly Asked Question', { listStyle:builder.ListStyle.button, maxRetries:MaxRetries, retryPrompt:DefaultErrorPrompt});
    },
    function (session, results) {
        try {
            switch (results.response.index) {
                case 0:     // Prepaid
                    session.beginDialog('Prepaid');
                    break;
                case 1:     // Postpaid
                    session.beginDialog('Postpaid');
                    break;
                case 2:     // Broadband
                    session.beginDialog('Broadband');
                    break;
                case 3:     // Roaming
                    session.beginDialog('Roaming');
                    break;
                case 4:
                    session.beginDialog('CommonlyAskedQuestion');
                    break;
                default:
                    break;
            }
        } catch (e) {
            // After max retries, will come here
            session.send("Sorry I messed up, let's try again");
            session.replaceDialog('menu');
        }
    },
    function (session) {
        // Reload menu
        session.replaceDialog('menu');
    }
]).triggerAction({
    matches: /^(menu)|(exit)|(quit)|(depart)|(bye)|(goodbye)|(begin)/i
});






//////////////////////////////////////////////////////////////////////////////
// Setup Restify Server
//////////////////////////////////////////////////////////////////////////////
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', connector.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': './dso',
	'default': 'digi.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
