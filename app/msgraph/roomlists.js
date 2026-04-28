var graph = require('./graph');

module.exports = function(callback, msalClient) {
	graph
		.getRoomList(msalClient)
		.then(
			(lists) => {
				var roomLists = [];
				lists.value.forEach(function(item, i, array) {
					roomLists.push(item.displayName);
				});
				callback(null, roomLists);
			},
			(err) => {
				callback(err, null);
			}
		)
		.catch((err) => callback(err, null));
};
