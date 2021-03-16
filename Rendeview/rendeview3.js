const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});
let path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });// if file ever moved need to change path
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

    async findTripLength(tempCenterpoint) {
        let originCoordinates = [];
        if (!tempCenterpoint) {
            console.log(`No temporary centerpoint`)
            tempCenterpoint = this.centerpointCoordinates;
        }
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
                destinations: [tempCenterpoint],
                origins: originCoordinates
            }
        })
        let rows = apiData.data.rows;
        let trips = [];
        for (let i = 0; i < rows.length; i++) {
            //console.log(trips[i].elements[0].duration.value);//value for time expressed in seconds
            //console.log(trips[i].elements[0].distance.value);//value for distance expressed in meters
            trips.push({
                value: rows[i].elements[0].duration.value,
                coordinates: originCoordinates[i],
            })
        }
        trips.sort((a, b) => b.value - a.value);
        let max = trips[0]
        let min = trips[trips.length - 1];
        let range = max.value - min.value;
        console.log(`${range}`);
        // if (range > 300) {
        //     console.log(`Balancing triggered`);
        //     console.log(`Old Tempcenterpoint is ${tempCenterpoint.lat},${tempCenterpoint.lng}`)
        //     let latToAdd = (max.coordinates.lat - tempCenterpoint.lat) / 3;
        //     let lngToAdd = (max.coordinates.lng - tempCenterpoint.lng) / 3;
        //     tempCenterpoint.lat += latToAdd;
        //     tempCenterpoint.lng += lngToAdd;
        //     console.log(`New Tempcenterpoint is ${tempCenterpoint.lat},${tempCenterpoint.lng}`)
        //     this.findTripLength(tempCenterpoint);
        // }
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
            // console.log(apiData.data.routes[0].legs);
            let steps = [];
            route.steps.forEach(element => {
                let individualStep = {
                    Maneuver: element.maneuver || 'none',
                    Distance: element.distance,
                    Duration: element.duration,
                    Instruction: element.html_instructions,
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