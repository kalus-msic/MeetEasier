module.exports = function (callback, roomEmail, roomName, startTime, endTime, bookingType, msalClient, subject) {
  var graph = require('./graph');

  const finalSubject = subject || "Rezervováno přes MeetEasier";
  const body = "Místnost rezervována přes panel u dveří";

  graph.bookRoom(msalClient, roomEmail, roomName, startTime, endTime, bookingType, finalSubject, body).then(
    (res) => {
      callback(null, res);
    },
    (err) => {
      console.log(err);
      callback(err, null);
    }
  ).catch((err) => {
    console.log(err);
    callback(err, null);
  });
};
