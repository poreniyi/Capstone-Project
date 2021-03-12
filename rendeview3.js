const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});require('dotenv').config();// if file ever moved need to change path
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
        let originCoordinates=[];
        let data = [
            {
                lat: 33.9408531,
                lng: -84.5204241
            },
            {
                lat: 34.0381785,
                lng: -84.5826712
            }
        ]
        for (let i = 0; i < this.places.length; i++) {
            originCoordinates.push({
                lat:this.places[i].coordinates.lat,
                lng:this.places[i].coordinates.lng,
            })
        }
        console.log(originCoordinates);
        let apiData = await client.distancematrix({
            params: {
                key: mykey,
                units:'imperial',
                destinations: this.centerpointCoordinates,
                origins:data
            }
        })
        console.log(apiData.data.rows[0].elements);

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
                Polyline: apiData.data.routes[0].overview_polyline,
                totalDistance: route.distance,
                totalDuration: route.duration,
                Steps: steps,
                Start: route.start_location,
                End: route.end_location,
            }
            places[i].Directions = obj;
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
    async findNearBySpots(centerpoint, type) {
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
        let bestMeetUps = possibleMeetUpSpots.slice(0, 5);
        return bestMeetUps;
    }

    async calculateResult() {
        await findDirections(places)
    }

    async returnResult() {
        return {
            centerpointCoordinates: this.centerpointCoordinates,
            places: this.places,
        }
    }

}


module.exports = Rendeview;