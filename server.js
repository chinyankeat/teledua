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
        
        session.send("Hello, I am Telco 2.0 Virtual Assistant. ");
        builder.Prompts.choice(session, "How can I help you today? ", 'Unable to Connect to Internet|Unable to Receive Call', { listStyle:builder.ListStyle.button, maxRetries:MaxRetries, retryPrompt:DefaultErrorPrompt});
    },
    function (session, results) {
        try {
            switch (results.response.index) {
                case 0:     // Prepaid
                    session.beginDialog('ConnectToInternet');
                    break;
                case 1:     // Postpaid
                    session.beginDialog('ReceiveCall');
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


bot.dialog('ConnectToInternet', [
    function (session) {        
        builder.Prompts.choice(session, "Is your VPN switched on? You will be able to see a key icon on the top menu of the phone if you are connected to a VPN.", "Yes|No|Exit", { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        switch (results.response.index) {
        case 0: //Yes
            session.replaceDialog('ValidDataPlan');
            break;
	    case 1: // No
            session.send("Open the Dash app > Control > Turn on Data Saving Mode. Your data should be working now.");
            builder.Prompts.choice(session, "", "Menu", { listStyle: builder.ListStyle.button });
            break;
        default:    // Next Page
            session.replaceDialog('menu');
            break;
        }
    },
    function (session, results) {
        session.replaceDialog('menu');
    }
]).triggerAction({
    matches: /(Connect To Internet)/i
});

bot.dialog('ValidDataPlan', [
    function (session) {        
        builder.Prompts.choice(session, "Are you on a valid data plan?", "Yes|No|Exit", { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        switch (results.response.index) {
        case 0: //Yes
            session.replaceDialog('BlockSpecificApp');
            break;
	    case 1: // No
            session.send("If your plan has expired, buy a new plan. To buy a new plan, open the Dash app > Choose duration > Set Budget > Adjust voice and data according to preference > Purchase Now. Your data should be working now.");
            session.replaceDialog('RestartMenu');
            break;
        default:    // Next Page
            session.replaceDialog('menu');
            break;
        }
    },
    function (session, results) {
        session.replaceDialog('menu');
    }
]).triggerAction({
    matches: /(Valid Data Plan)/i
});

bot.dialog('BlockSpecificApp', [
    function (session) {        
        builder.Prompts.choice(session, "Did you block that specific app access? To check please open Dash app > control", "Yes|No|Exit", { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        switch (results.response.index) {
        case 0: //Yes
            session.send("Please click on the app to unblock the app. Your data should be working now");
            session.replaceDialog('RestartMenu');
            break;
	    case 1: // No
            session.send("Someone from the team will call you in the next 24 hours to troubleshoot further");
            session.replaceDialog('RestartMenu');
            break;
        default:    // Next Page
            session.replaceDialog('menu');
            break;
        }
    }
]).triggerAction({
    matches: /(Block Specific App)/i
});

bot.dialog('ReceiveCall', [
    function (session) {        
        builder.Prompts.choice(session, "Is your VPN switched on? You will be able to see a key icon on the top menu of the phone if you are connected to a VPN", "Yes|No|Exit", { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        switch (results.response.index) {
        case 0: //Yes
            session.replaceDialog('CheckDialer');
            break;
	    case 1: // No
            session.send("Open Dash app > Control > Turn on Data Saving Mode. Your problem should be solved now");
            session.replaceDialog('RestartMenu');
            break;
        default:    // Next Page
            session.replaceDialog('menu');
            break;
        }
    },
    function (session, results) {
        session.replaceDialog('menu');
    },
]).triggerAction({
    matches: /(Cannot Receive Calls)|(Unable to Receive Calls)|(Unable Receive Calls)/i
});

bot.dialog('CheckDialer', [
    function (session) {        
            session.send("Is your dialer registered/green?");
            session.send("To check, open dialer app > click on wallet icon on top right of the app > phone icon should both be registered/green.");
            builder.Prompts.choice(session, "", "Still Not Working|Its Working Now", { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        switch (results.response.index) {
        case 0:
            session.send("Someone from the team will call you in the next 24 hours to troubleshoot further");
            session.replaceDialog('RestartMenu');
            break;
	    case 1:
            session.send("Great, I'm glad I can help you");
            session.replaceDialog('RestartMenu');
            break;
        default:    // Next Page
            session.replaceDialog('menu');
            break;
        }
    }
]).triggerAction({
    matches: /(Check Dialer)/i
});

bot.dialog('RestartMenu', [
    function (session) {        
        builder.Prompts.choice(session, "Okay, Lets Start Again", "Menu", { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        session.replaceDialog('menu');
    }
]).triggerAction({
    matches: /(Cannot Receive Calls)|(Unable to Receive Calls)|(Unable Receive Calls)/i
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
