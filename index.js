const express = require('express');
const exp = express();
const bodyParser = require('body-parser');
const path = require('path');
var fs = require('fs');
const ServerSetting = require("./ServerSettings.json");
var cors = require('cors');

/*Middleware*/
exp.use(cors());
exp.use(bodyParser.json({limit: '5000mb'}));
exp.use(bodyParser.urlencoded({limit: '5000mb', extended: false}));
exp.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});
let MongoClient = require('mongodb').MongoClient;
var mongoDbUrl = ServerSetting.global.mongodbUrl;
var mongoDbName = ServerSetting.global.mongodbName;
var mongodbUserCollection = ServerSetting.global.mongodbUserCollection;


exp.get('/api/healthcheck', function (req, res) {
    res.send("OK");
});

exp.post('/api/insertData', function (req, res) {

    MongoClient.connect(mongoDbUrl, {useNewUrlParser: true, useUnifiedTopology: true}, function (err, client) {
        if (err) throw err;
        let db = client.db(mongoDbName);

        var requestObj = {
            name: req.body.name,
            surname: req.body.surname
        };

        db.collection(mongodbUserCollection).insertOne(requestObj, function (err, result) {
            if (err) throw err;
            console.log(JSON.stringify(requestObj) + " inserted to " + mongodbUserCollection);
            res.send(result);
            client.close();
        });
    });

});

exp.get('/api/getData', function (req, res) {


    MongoClient.connect(mongoDbUrl, {useNewUrlParser: true, useUnifiedTopology: true}, function (err, client) {
        if (err) throw err;
        let db = client.db(mongoDbName);
        const collection = db.collection(mongodbUserCollection);


        collection.aggregate(
            [
                {"$sort": {"count": -1}},
                {"$limit": 100}
            ]).toArray(
            function (err, result) {
                if (err) throw err;
                res.setHeader('Content-Type', 'application/json');
                res.json(result);
                client.close();
            }
        );
    });
});


exp.listen(ServerSetting.global.port, () => console.log(ServerSetting.global.url + ' listening on port ' + ServerSetting.global.port));
