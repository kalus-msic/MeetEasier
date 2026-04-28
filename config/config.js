const msal = require('@azure/msal-node');
const cacheLocation = './data/cache.json';
const cachePlugin = require('../app/msgraph/cachePlugin')(cacheLocation);

// Read the .env-file
require('dotenv').config();

// expose our config directly to our application using module.exports
module.exports = {
	exchange: {
		// this user MUST have full access to all the room accounts
		username: process.env.EWS_USERNAME ? process.env.EWS_USERNAME : 'EWS_USERNAME_NOT_SET',
		password: process.env.EWS_PASSWORD ? process.env.EWS_PASSWORD : 'EWS_PASSWORD_NOT_SET',
		// url for the ews-api on the exchange-server
		uri: process.env.EWS_URI ? process.env.EWS_URI : 'https://outlook.office365.com/EWS/Exchange.asmx'
	},
	// Configuration for the msgraph-sdk
	msalConfig: {
		auth: {
			clientId: process.env.OAUTH_CLIENT_ID,
			authority: process.env.OAUTH_AUTHORITY,
			clientSecret: process.env.OAUTH_CLIENT_SECRET
		},
		/* cache: {
			cachePlugin
		},*/
		system: {
			loggerOptions: {
				// TODO: Better logging / other options?
				loggerCallback(loglevel, message, containsPii) {
					console.log(message);
				},
				piiLoggingEnabled: false,
				logLevel: msal.LogLevel.Error
			}
		}
	},
	// TODO: Check if we really need the domain variable
	// Ex: CONTOSO.COM, Contoso.com, Contoso.co.uk, etc.
	domain: process.env.DOMAIN ? process.env.DOMAIN : 'ms-ic.cz',

	// Search-settings to use when retrieving data from the calendars
	calendarSearch: {
		useGraphAPI: process.env.SEARCH_USE_GRAPHAPI ? process.env.SEARCH_USE_GRAPHAPI : true,
		maxDays: process.env.SEARCH_MAXDAYS ? process.env.SEARCH_MAXDAYS : 10,
		maxRoomLists: process.env.SEARCH_MAXROOMLISTS ? process.env.SEARCH_MAXROOMLISTS : 10,
		maxRooms: process.env.SEARCH_MAXROOMS ? process.env.SEARCH_MAXROOMS : 10,
		maxItems: process.env.SEARCH_MAXITEMS ? process.env.SEARCH_MAXITEMS : 6
	}
};
