const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({}); 
let path = require('path');
require('dotenv').config({path:path.resolve(__dirname,'../.env')});// if file ever moved need to change path
let mykey = process.env.GMaps_Key;

// Sample data until we figure out how to transfer data from form into class
sampleLocations = ['Ponce City Market', 'KSU Marietta Campus', 'Six Flags over Georgia'];

class Rendeview {
    places = [];// stores addresses and that were sent as a request
    centerpointCoordinates = {};
    nearbySpots = [];
    constructor(arrayLocations) {
        this.places = arrayLocations; //store all places
        this.calculateCenterpoint();
    }

    async findTripLength() {
        let originCoordinates = [];
        let tempCenterpoint = this.centerpointCoordinates;
        for (let i = 0; i < this.places.length; i++) {
            originCoordinates.push({
                lat: this.places[i].coordinates.lat,
                lng: this.places[i].coordinates.lng,
            })
        }
        let apiData = await client.distancematrix({
            params: {
                key: mykey,
                units: 'imperial',
                destinations: [this.centerpointCoordinates],
                origins: originCoordinates
            }
        })
        let rows = apiData.data.rows;
        let totalTripTime = 0;
        let totalTripDistance = 0;
        for (let i = 0; i < rows.length; i++) {
            // console.log(rows[i].elements[0].duration);//value for time expressed in seconds
            //console.log(rows[i].elements[0].distance);//value for distance expressed in meters
            totalTripTime += rows[i].elements[0].duration
            totalTripDistance += rows[i].elements[0].distance
        }
        let avgTripTime = totalTripTime / rows.length;
        let avgTripDistance = totalTripTime / rows.length;
        if (avgTripTime > 300 || avgTripDistance > 8046.72) { // longer than 5mins or above 5miles 
            //balancing algorithm
        }
        //console.log(apiData.data.rows[0].elements);
        this.centerpointCoordinates = tempCenterpoint;
    }

    async findDirections() {
        for (let i = 0; i < this.places.length; i++) {//loops through all the places and makes an apiCall on each one
            let apiData = await client.directions({
                params: {
                    key: mykey,
                    units: 'imperial',
                    origin: {
                        latitude: this.places[i].coordinates.lat,
                        longitude: this.places[i].coordinates.lng
                    },
                    destination: {
                        latitude: this.centerpointCoordinates.lat,
                        longitude: this.centerpointCoordinates.lng
                    },
                }
            })
            let route = apiData.data.routes[0].legs[0];
            //  console.log(apiData.data.routes[0].legs);
            let steps = [];
            route.steps.forEach(element => {
                let individualStep = {
                    Maneuver: element.maneuver || 'none',
                    Distance: element.distance,
                    Duration: element.duration,
                }
                steps.push(individualStep);
            })
            let obj = {
                Polyline: apiData.data.routes[0].overview_polyline.points,
                totalDistance: route.distance,
                totalDuration: route.duration,
                Steps: steps,
                Start: route.start_location,
                End: route.end_location,
            }
            this.places[i].Directions = obj;
            //console.log(obj);
        }
    }


    async calculateCenterpoint() {
        let totalLat = 0;
        let totalLng = 0;
        for (let i = 0; i < this.places.length; i++) {
            totalLat += this.places[i].coordinates.lat;
            totalLng += this.places[i].coordinates.lng;
        }
        let avgLat = totalLat / this.places.length;
        let avgLng = totalLng / this.places.length;
        this.centerpointCoordinates = { lat: avgLat, lng: avgLng };
    }
    async findNearBySpots(type) {
        type = 'cafe';
        let apiData = await client.placesNearby({
            params: {
                key: mykey,
                radius: 1609.34,// distance in meters
                type: type,
                location: {
                    latitude: this.centerpointCoordinates.lat,
                    longitude: this.centerpointCoordinates.lng,
                }
            }
        })
        let possibleMeetUpSpots = [];
        apiData.data.results.forEach(element => {
            if (element.business_status == 'OPERATIONAL') {
                possibleMeetUpSpots.push({
                    name: element.name,
                    coordinates: element.geometry.location,
                    address: element.vicinity,
                    type: type
                })
            }
        })
        //sort possibleMeetUpSpots
        this.nearbySpots = possibleMeetUpSpots.slice(0, 5);
        //return bestMeetUps;
    }

    async calculateResult() {
        await this.findTripLength()
        await this.findDirections()
        await this.findNearBySpots();
    }

    async returnResult() {
        await this.calculateResult()
        return {
            centerpointCoordinates: this.centerpointCoordinates,
            places: this.places,
            possibleMeetUpSpots: this.nearbySpots
        }
    }

}


module.exports = Rendeview;