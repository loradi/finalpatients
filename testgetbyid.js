var http = require("https");

var options = {
  "method": "PUT",
  "hostname": [
    "finalpatient",
    "herokuapp",
    "com"
  ],
  "path": [
    "patients",
    "61"
  ],
  "headers": {
    "Content-Type": "application/json",
    "cache-control": "no-cache",
    "Postman-Token": "79413904-05c6-41ba-822d-9f044c881283"
  }
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.write(JSON.stringify({ firstName: 'Diego',
  lastName: 'lastname',
  phoneNumber: 12345,
  address: 'address',
  dateBirthDay: 'dateBrithDay',
  department: 'department',
  doctorName: 'DoctorName' }));
req.end();