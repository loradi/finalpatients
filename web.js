var express = require("express");
var mysql = require('mysql');
var app = express();
app.use(express.logger());
var getCounter = 0;
var postCounter = 0;
var deleteCounter = 0;
var putCounter = 0;

var db_config = {
    host: 'us-cdbr-iron-east-01.cleardb.net',
    user: 'bed12f86371223',
    password: 'f690ea7b',
    database: 'heroku_9a357d11f3df65c',
    multipleStatements: true
};
app

  // Maps req.body to req.params so there is no switching between them
  .use(express.bodyParser())

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
    console.log("Send request >>>");
    getCounter ++;
    connection.query('SELECT idpatients, firstName, lastName, phoneNumber, address, dateBirthDay, department, doctorName FROM patients', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['code: {201} Patients', rows]);
    });
});

//get all records
app.get('/patients/records', function(request, response) {
    console.log("Send request >>>");
    getCounter ++;
    connection.query('SELECT idpatients, recordPatient, bloodPreasure, respirationRate, bloodOxigen, heartRate FROM patients', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['code: {201} Patients', rows]);
    });
});

//get an records by ID patients
app.get('/patients/:id/records', function(request, response) {
    console.log("Send request >>>");
    getCounter ++;
    connection.query('SELECT idpatients, recordPatient, bloodPreasure, respirationRate, bloodOxigen, heartRate FROM patients WHERE idpatients = ?', [request.params.id], function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['code: {201} Patients', rows]);
    });
});
//get  patients by ID 
app.get('/patients/:id', function(request, response) {
    console.log("Send request >>>");
    getCounter ++;
    connection.query('SELECT idpatients, firstName, lastName, phoneNumber, address, dateBirthDay, department, doctorName FROM patients WHERE idpatients = ?', [request.params.id], function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['code: {201} Patients', rows]);
    });
});

//delete all patients
app.delete('/patients', function(request, response) {
    console.log("Send request >>>");
    deleteCounter ++;
    connection.query('DELETE FROM patients', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['code: {201} description: {All patients was deleted sucessfully}']);
    });
});

//delete all records
app.delete('/patients/records', function(request, response) {
    console.log("Send request >>>");
    deleteCounter ++;
    connection.query('UPDATE patients set recordPatient = null, bloodPreasure = null, respirationRate = null, bloodOxigen = null, heartRate = null', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['code: {201} description: {All records patients was deleted sucessfully}']);
    });
});

//delete patients by id 
app.delete('/patients/:id', function(request, response) {
    console.log("Send request >>>");
    deleteCounter ++;
    console.log("ACA ENTRO AL DELETE POR ID ", request.params.id);
    connection.query('DELETE FROM patients WHERE idpatients = ?',[request.params.id], function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['code: {201} description: {The patient was deleted sucessfully}']);
    });
});

//delete Record by id 
app.delete('/patients/:id/records', function(request, response) {
    console.log("Send request >>>");
    deleteCounter ++;
    console.log("ACA ENTRO AL DELETE POR ID DEL RECORD ", request.params.id);
    connection.query("UPDATE patients set recordPatient = null, bloodPreasure = null, respirationRate = null, bloodOxigen = null, heartRate = null WHERE idpatients ='"+request.params.id+"'", function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['code: {201} description: {The patient was deleted sucessfully}']);
    });
});

//Insert patients with validations
app.post('/patients', function(request, response, next) {
    console.log("Send request >>>");
    postCounter ++;
    let reqValidErrors = isPatientRequestValid(request);
    if (reqValidErrors) {
        response.status(400).send(reqValidErrors);
        return;
    }
    var sql ="INSERT INTO patients (idpatients, firstName, lastName, phoneNumber, address, dateBirthDay, department, doctorName) VALUES('','"+request.body.firstName+"','"+request.body.lastName+"',"+request.body.phoneNumber+",'"+request.body.address+"','"+request.body.dateBirthDay+"','"+request.body.department+"','"+request.body.doctorName+"')";
    console.log(sql);
    connection.query(sql, function(err, rows, fields) {
        if (err) {
            console.log('error code: {404} ', err);
            throw err;
        }
        response.send(['code: {201} description: {The patient was created sucessfully}']);
    });
});

//Insert record by patient
app.post('/patients/:id/records', function(request, response) {
    console.log("Send request >>>");
    postCounter ++;
    console.log("this is the request to create a record for ID patient", request.body.heartRate);
    var sql ="UPDATE patients set recordPatient = '"+request.body.recordPatient+"', bloodPreasure = '"+request.body.bloodPreasure+"', respirationRate = '"+request.body.respirationRate+"', bloodOxigen = '"+request.body.bloodOxigen+"', heartRate = '"+request.body.heartRate+"' WHERE idpatients = '"+request.params.id+"'";
    console.log(sql);
    connection.query(sql, function(err, rows, fields) {
        if (err) {
            console.log('error code: {404} ', err);
            throw err;
        }
        response.send(['code: {201} description: {The record patient was created sucessfully}']);
    });
});

//Update record by ID patient
app.put('/patients/:id/records', function(request, response) {
    console.log("Send request >>>");
    putCounter ++;
    var sql ="UPDATE patients set recordPatient = '"+request.body.recordPatient+"', bloodPreasure = '"+request.body.bloodPreasure+"', respirationRate = '"+request.body.respirationRate+"', bloodOxigen = '"+request.body.bloodOxigen+"', heartRate = '"+request.body.heartRate+"' WHERE idpatients = '"+request.params.id+"'";
    console.log(sql);
    connection.query(sql, function(err, rows, fields) {
        if (err) {
            console.log('error code: {404} ', err);
            throw err;
        }
        response.send(['code: {201} description: {The record patient was UPDATED sucessfully}']);
    });
});

//Update patient
app.put('/patients/:id', function(request, response) {
    console.log("Send request >>>");
    putCounter ++;
    var sql ="UPDATE patients set firstName = '"+request.body.firstName+"', lastName = '"+request.body.lastName+"', phoneNumber = '"+request.body.phoneNumber+"', address = '"+request.body.address+"', dateBirthDay = '"+request.body.dateBirthDay+"', department = '"+request.body.department+"', doctorName = '"+request.body.doctorName+"'  WHERE idpatients = '"+request.params.id+"'";
    console.log(sql);
    connection.query(sql, function(err, rows, fields) {
        if (err) {
            console.log('error code: {404} ', err);
            throw err;
        }
        response.send(['code: {201} description: {The patient was UPDATED sucessfully}']);
    });
});

//Users manage Users 
//get  user and password 
app.get('/users/password/:username', function(request, response) {
    console.log("Send request >>>");
    getCounter ++;
    connection.query('SELECT username, password FROM users WHERE username = ?', [request.params.username], function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['code: {201} users', rows]);
    });
});


var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log('FullPatients:');
    console.log(' /patients');
    console.log(' /patients/:id');
    console.log(' /patients/records');
    console.log(' /patients/:id/records');  
    console.log("Listening on " + port);
    console.log("METHODS REQUEST; POST:"+postCounter+" PUT: "+putCounter+" DELETE: "+deleteCounter+" GET: "+getCounter); 
});

function isPatientRequestValid(req) {
    req.assert("firstName", "Field 'first name' is required!").notEmpty();
    req.assert("lastName", "Field 'last_name' is required!").notEmpty();
    req.assert("phoneNumber", "Field 'phone number' is required!").notEmpty();
    req.assert("address", "Field 'address' must be an integer").isInt();
    req.assert("dateBirthDay", "Field 'date of Bithday' is required!").notEmpty();
    req.assert("department", "Field 'department' is required!").notEmpty();
    req.assert("doctorName", "Field 'doctorname' is required!").notEmpty();
    return req.validationErrors();
}

function isRecordsRequestValid(req) {
    req.assert("recordPatient", "Field 'record patient title' is required!").notEmpty();
    req.assert("bloodPreasure", "Field 'blood preasure' is required!").notEmpty();
    req.assert("respirationRate", "Field 'respiration rate' is required!").notEmpty();
    req.assert("bloodOxigen", "Field 'blood oxigen' is required!").notEmpty();
    req.assert("heartRate", "Field 'heart rate' is required!").notEmpty();

    return req.validationErrors();
}
