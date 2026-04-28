const graph = require('@microsoft/microsoft-graph-client');
const config = require('../../config/config');
require('isomorphic-fetch');

// TODO: Move this somewhere else?
Date.prototype.addDays = function(days) {
	const date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
};

module.exports = {
	getRoomList: async (msalClient) => {
		const client = getAuthenticatedClient(msalClient);

		const roomlist = await client
			.api('/places/microsoft.graph.roomlist')
			.select('displayName, emailAddress')
			.orderby('displayName')
			.top(parseInt(config.calendarSearch.maxRoomLists))
			.get();
		return roomlist;
	},

	getRooms: async (msalClient, email) => {
		const client = getAuthenticatedClient(msalClient);

		const rooms = await client
			.api(`/places/${email}/microsoft.graph.roomlist/rooms`)
			.get();
		return rooms;
	},

	getCalendarView: async (msalClient, email) => {
		const client = getAuthenticatedClient(msalClient);

		const start_datetime = new Date();
		const end_datetime = start_datetime.addDays(parseInt(config.calendarSearch.maxDays));

		const events = await client
			.api(`/users/${email}/calendar/calendarView`)
			.query(`startDateTime=${start_datetime.toISOString()}&endDateTime=${end_datetime.toISOString()}`)
			.select('organizer,subject,start,end,sensitivity')
			.orderby('Start/DateTime')
			.top(parseInt(config.calendarSearch.maxItems))
			.get();
		return events;
	}
};

function getAuthenticatedClient(msalClient) {
	if (!msalClient) {
		throw new Error(`Invalid MSAL state. Client: ${msalClient ? 'present' : 'missing'}`);
	}

	const clientCredentialRequest = {
		scopes: [ '.default' ],
		skipCache: false
	};

	// Initialize Graph client
	const client = graph.Client.init({
		// Implement an auth provider that gets a token
		// from the app's MSAL instance
		authProvider: async (done) => {
			try {
				const response = await msalClient.acquireTokenByClientCredential(clientCredentialRequest);

				// First param to callback is the error,
				// Set to null in success case
				done(null, response.accessToken);
			} catch (err) {
				console.log(JSON.stringify(err, Object.getOwnPropertyNames(err)));
				done(err, null);
			}
		}
	});

	return client;
}
