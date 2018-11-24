var express = require("express");
var mysql = require('mysql');
var app = express();
app.use(express.logger());

var db_config = {
    host: 'us-cdbr-iron-east-01.cleardb.net',
    user: 'bed12f86371223',
    password: 'f690ea7b',
    database: 'heroku_9a357d11f3df65c',
    multipleStatements: true
};

var connection;

function handleDisconnect() {
    console.log('1. connecting to db:');
    connection = mysql.createConnection(db_config); // Recreate the connection, since
													// the old one cannot be reused.

    connection.connect(function(err) {              	// The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('2. error when connecting to db:', err);
            setTimeout(handleDisconnect, 1000); // We introduce a delay before attempting to reconnect,
        }                                     	// to avoid a hot loop, and to allow our node script to
    });                                     	// process asynchronous requests in the meantime.
    											// If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('3. db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { 	// Connection to the MySQL server is usually
            handleDisconnect();                      	// lost due to either server restart, or a
        } else {                                      	// connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();

//get all patients
app.get('/patients', function(request, response) {
    connection.query('SELECT idpatients, firstName, lastName, phoneNumber, address, dateBirthDay, department, doctorName FROM patients', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['Patients', rows]);
    });
});

//get all records
app.get('/patients/records', function(request, response) {
    connection.query('SELECT idpatients, recordPatient, bloodPreasure, respirationRate, bloodOxigen, heartRate FROM patients', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['Patients', rows]);
    });
});

//get an records by ID patients
app.get('/patients/:id/records', function(request, response) {
    connection.query('SELECT idpatients, recordPatient, bloodPreasure, respirationRate, bloodOxigen, heartRate FROM patients WHERE idpatients = ?', [request.params.id], function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['Patients', rows]);
    });
});
//get  patients by ID 
app.get('/patients/:id', function(request, response) {
    connection.query('SELECT idpatients, firstName, lastName, phoneNumber, address, dateBirthDay, department, doctorName FROM patients WHERE idpatients = ?', [request.params.id], function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['Patients', rows]);
    });
});

//delete all patients
app.delete('/patients', function(request, response) {
    connection.query('DELETE FROM patients', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['All patients was deleted sucessfully']);
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
