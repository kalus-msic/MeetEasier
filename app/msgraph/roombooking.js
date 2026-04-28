module.exports = function (callback, roomEmail, roomName, startTime, endTime, bookingType, msalClient) {
  var graph = require('./graph');

  const subject = "Rezervováno přes MeetEasier";
  const body = "Místnost rezervována přes panel u dveří";

  graph.bookRoom(msalClient, roomEmail, roomName, startTime, endTime, bookingType, subject, body).then(
    (res) => {
      callback(null);
      console.log(res);
    },
    (err) => {
      console.log(err);
      callback(err, null);
    }
  ).catch((err) => {
    console.log(err);
    callback(err, null);
  });

  function processTime(appointmentTime) {
    var time = JSON.stringify(appointmentTime);
    time = time.replace(/"/g, "");
    var time = new Date(time);
    var time = time.getTime();

    return time;
  }
};
