const mysql = require('mysql');
const express = require('express');
var app = express();
const bodyparser = require('body-parser');

app.use(bodyparser.json());

var mysqlConnection = mysql.createConnection({
    host: 'us-cdbr-iron-east-01.cleardb.net',
    user: 'bed12f86371223',
    password: 'f690ea7b',
    database: 'heroku_9a357d11f3df65c',
    multipleStatements: true
});
console.log(' /patients');
console.log(' /patients/:id');  

mysqlConnection.connect((err) => {
    if (!err)
        console.log('DB connection succeded.');
    else
        console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2));
});

app.listen(3000, () => console.log('Express server is runnig at port no : 3000'));


//Get all patients
app.get('/patients', (req, res) => {
    mysqlConnection.query('SELECT idpatients, firstName, lastName, phoneNumber, address, dateBirthDay, department, doctorName FROM patients', (err, rows, fields) => {
        if (!err) {
            var result = JSON.parse('{"result" : "' + rows +' "}')
            res.send(rows);
        }
            
        else
            console.log(err);
    })
});

//Get all records
app.get('/patients/records', (req, res) => {
    mysqlConnection.query('SELECT idpatients, recordPatient FROM patients', (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Get an records by Id patients
app.get('/patients/:id/records', (req, res) => {
    mysqlConnection.query('SELECT idpatients, recordPatient FROM patients WHERE idpatients = ?', [req.params.id], (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Get an patients by Id patients
app.get('/patients/:id', (req, res) => {
    mysqlConnection.query('SELECT idpatients, firstName, lastName, phoneNumber, address, dateBirthDay, department, doctorName FROM patients WHERE idpatients = ?', [req.params.id], (err, rows, fields) => {
        if (!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//Delete an patients by Id
app.delete('/patients/:id', (req, res) => {
    mysqlConnection.query('DELETE FROM patients WHERE idpatients = ?', [req.params.id], (err, rows, fields) => {
        if (!err)
            res.send('Deleted patient by ID successfully.');
        else
            console.log(err);
    })
});
//Delete all patients
app.delete('/patients', (req, res) => {
    mysqlConnection.query('DELETE FROM patients', (err, rows, fields) => {
        if (!err)
            res.send('Deleted all patients successfully.');
        else
            console.log(err);
    })
});

//Insert an patients
app.post('/patients', (req, res) => {
    let pat = req.body;
    var sql ="INSERT INTO patients (firstName, lastName, phoneNumber, address, dateBirthDay, department, doctorName) VALUES('"+pat.firstName+"','"+pat.lastName+"',"+pat.phoneNumber+",'"+pat.address+"','"+pat.dateBirthDay+"','"+pat.department+"','"+pat.doctorName+"')";
    console.log(sql);
    mysqlConnection.query(sql,(err, rows, fields) => {
        if (!err)
                res.send('Inserted patient : '+pat.firstName);
        else
            console.log(err);
    })
});



//update records for patient
app.put('/patients/:id/records', (req, res) => {
    let pati = req.body;
    var sql = "UPDATE patients SET recordPatient = '"+pati.recordPatient+"' WHERE idpatients = ?"
    console.log(sql);
    mysqlConnection.query(sql,[req.params.id], (err, rows, fields) => {
        if (!err)
            res.send('Record successfully inserted');
        else
            console.log(err);
    })
});

//Update an patients
app.put('/patients/:id', (req, res) => {
    let upat = req.body;
    var sql = "UPDATE patients SET firstName = '"+upat.firstName+"', lastName = '"+upat.lastName+"', phoneNumber = "+upat.phoneNumber+", address = '"+upat.address+"', dateBirthDay = '"+upat.dateBirthDay+"', department = '"+upat.department+"', doctorName = '"+upat.doctorName+"' WHERE idpatients = ?"
    console.log(sql);
    mysqlConnection.query(sql,[req.params.id], (err, rows, fields) => {
        if (!err)
            res.send('Updated patient successfully');
        else
            console.log(err);
    })
});
