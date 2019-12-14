const asyncFunctions = require('./asyncFunctions');

const LocationModel = require('../models/LocationModel');
const UserModel = require('../models/User');
const https = require('https');
const express = require('express');
const hospitalModel = require('../models/hospitalCheckModel');
const router = express.Router();
const promise = require('promise');

const request = require('sync-request');
const sendText = require('./sendmessage');



router.get('/', (req, res) => {
    LocationModel.find((err, docs) => {
        if (!err) {
            res.send(docs);
        } else {
            res.send(err);
        }
    })
});

router.get('/hospitals', (req, res) => {
    hospitalModel.find((err, doc) => {
        res.send(doc);
    })
})

router.post('/webAuth', async(req, res, next) => {

    console.log(req.body);
    if (!req.body.lat || !req.body.long) {

        res.writeHeader(200, { "Content-Type": "text/html" });
        res.write(JSON.stringify(req.body));
        res.end("GPS LOCATION ERROR");
        return;
    }
    var UserData = await asyncFunctions.checkAuthNo(req.body.authNo);
    if (UserData.length != 1) {
        res.render('invalid-auth');
        return;
    } else {
        console.log(UserData);

        detailsForText = {
            name: `${UserData[0].Fname} ${UserData[0].Lname}`,
            lat: req.body.lat,
            long: req.body.long,
            vehicle: UserData[0].vno,
            ph1: UserData[0].ecpn1,
            ph2: UserData[0].ecpn2,
            ph3: UserData[0].ecpn3,
        }
        nearbyDetails = await findAllDetails(detailsForText);
        console.log(nearbyDetails);
        res.render('gethelp', nearbyDetails);
        res.end('');
    }

})

router.post('/webAuthLoggedin', async(req, res, next) => {

    console.log(req.body);
    if (!req.body.lat || !req.body.long) {

        res.writeHeader(200, { "Content-Type": "text/html" });
        res.write(JSON.stringify(req.body));
        res.end("GPS LOCATION ERROR");
        return;
    }
    var UserData = await asyncFunctions.checkAuthNo(req.body.authNo);
    if (UserData.length != 1) {
        res.render('invalid-auth-loggedin');
        return;
    } else {
        console.log(UserData);

        detailsForText = {
            name: `${UserData[0].Fname} ${UserData[0].Lname}`,
            lat: req.body.lat,
            long: req.body.long,
            vehicle: UserData[0].vno,
            ph1: UserData[0].ecpn1,
            ph2: UserData[0].ecpn2,
            ph3: UserData[0].ecpn3,
        }
        nearbyDetails = await findAllDetails(detailsForText);
        console.log(nearbyDetails);
        res.render('gethelp-loggedin', nearbyDetails);
        res.end('');
    }

})






router.post('/iotAuth', async(req, res) => {
    if (!req.body.lat || !req.body.long) {

        res.writeHeader(200, { "Content-Type": "text/html" });
        res.write(JSON.stringify(req.body));
        res.end("GPS LOCATION ERROR");
        return;
    }

    function findUserData() {
        return new promise(
            (resolve) => {

                UserModel.find({ macno: req.body.mac }, (err, doc) => {
                    if (!err) {
                        resolve(doc);
                    } else {
                        console.log(err);
                    }
                });

            }
        )
    }
    console.log(req.body);

    res.writeHeader(200, { "Content-Type": "text/html" });

    UserData = await findUserData();


    if (UserData.length != 1) {
        res.end(`sent mac address ${req.body.mac}  is Not registered`);
        return;
    } else {
        console.log(UserData);

        detailsForText = {
            name: `${UserData[0].Fname} ${UserData[0].Lname}`,
            lat: req.body.lat,
            long: req.body.long,
            vehicle: UserData[0].vno,
            ph1: UserData[0].ecpn1,
            ph2: UserData[0].ecpn2,
            ph3: UserData[0].ecpn3,

        }
        messages = await findAllDetails(detailsForText);
        for (var i = 0; i < messages.length; i++) {
            res.write(messages[i]);
        }
    }
    res.end('');
});

module.exports = router;



async function findAllDetails(UserData) {
    const messages = [];
    const errors = [];


    var Hosphone_number, Polphone_number, place_id1, place_id2, Hosname;
    var PoliceName;


    var location = new LocationModel({
        latitude: UserData.lat,
        longitude: UserData.long
    });


    location.save((err, docs) => {
        if (err) {
            console.log(JSON.stringify(err, undefined, 0));
            return;
        } else {

            messages.push("DATA POSTED SUCCESSFULLY : " + UserData.lat + " , " + UserData.long + " <br> ");
        }
    })
    latitude = UserData.lat;
    longitude = UserData.long;
    // 85.82736819029014    20.338958274723307

    var i = 0;
    //searching for hospitals nearby
    var Hosdata = await asyncFunctions.findplaceId(UserData.lat, UserData.long);
    var PolData = await asyncFunctions.findplaceIdPolice(UserData.lat, UserData.long);
    while (!Hosphone_number) {

        ///finding nearby places

        place_id1 = Hosdata.results[i].place_id;

        console.log("Hos place_id = " + place_id1);

        var Hosdet = await asyncFunctions.findPlaceDetails(place_id1);
        Hosname = Hosdet.result.name;
        Hosphone_number = Hosdet.result.formatted_phone_number;
        i += 1;


    }

    i = 0;
    while (!Polphone_number) {
        place_id2 = PolData.results[i].place_id;
        console.log("Pol place_id = " + place_id2);
        var polDet = await asyncFunctions.findPlaceDetails(place_id2);
        console.log(polDet.result);
        PoliceName = polDet.result.name;
        console.log("POLICE NAME :" + polDet.result.name + " : " + PoliceName);
        Polphone_number = polDet.result.formatted_phone_number;
        i += 1;

    }

    var hospital = new hospitalModel({
        hname: Hosname,
        phoneNumber: Hosphone_number

    });



    hospital.save((err, docs) => {
        if (!err)
            messages.push("<br>hospital added successfully <br>")
        else {
            console.log(err);
        }

    })

    nearbyDetails = {
        HosName: Hosname,
        HosPhone_number: Hosphone_number,
        hospitalPlaceId: `https://www.google.com/maps/embed/v1/directions?origin=${UserData.lat},${UserData.long}&destination=place_id:${place_id1}&key=AIzaSyCZB0Xb0NHCfdEi8DpZGImUTHT80c9UpBk`,
        PoliceName: PoliceName,
        PolPhone_number: Polphone_number,
        SOS1: UserData.ph1,
        SOS2: UserData.ph2,
        SOS3: UserData.ph3
    }



    messages.push("<br><h2>" + sendText(hospital, UserData) + "</h2><br>");



    messages.push("Hospital Name = " + Hosname + "<br>");
    messages.push("Hospital Phone = " + Hosphone_number + "<br><br>");
    messages.push("Police Station Name = " + PoliceName + "<br>");
    messages.push("Police station Phone = " + Polphone_number + "<br>");

    messages.push("<br>MESSAGE SENT SUCCESSFULLY");
    console.log(messages);

    return nearbyDetails;




}