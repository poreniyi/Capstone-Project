const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});
let path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });// if file ever moved need to change path
let mykey = process.env.GMaps_Key;

//Require spherical geometry module for interpolate function
const sg = require('spherical-geometry-js');

// Sample data 
sampleLocations = [
  {
    "PersonsName": "Person:1",
    "coordinates": {
      "lat": 34.03817850000001,
      "lng": -84.5826712
    },
    "location": "Kennesaw State University"
  },
  {
    "PersonsName": "Person:2",
    "coordinates": {
      "lat": 33.8839926,
      "lng": -84.51437609999999
    },
    "location": "Smyrna"
  },
  {
    "PersonsName": "Person:3",
    "coordinates": {
      "lat": 33.772792,
      "lng": -84.3658596
    },
    "location": "Ponce City Market"
  }
];

class Rendeview {
    places = [];                    //stores location data that was submitted
    centerpointCoordinates = {};    //stores centerpoint coordinates
    nearbySpots = [];               //stores valid meetup locations
    type = "";                      //stores user entered PoI type
    searchRadius = 1609.34;         //meters, 1609.34m = 1mi, will be overwritten to scale for overall distance
    MAX_SEARCH_RADIUS = 10000       //meters, 10000m(10km) = ~6.2mi, used as cap for how large searchRadius can be
    
    constructor(arrayLocations, type) {
        this.places = arrayLocations; //store all places
        this.type = type;
        this.calculateCenterpoint();
    }

    //Unused in favor of balanceDriveTime()
    async findTripLength(tempCenterpoint) {
        let originCoordinates = [];
        if (!tempCenterpoint) {
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

    //Currently only used to create polyline on final map result
    async findDirections() {
        for (let i = 0; i < this.places.length; i++) {//loops through all the places and makes an apiCall on each one
            let apiData = await client.directions({
                params: {
                    key: mykey,
                    units: 'imperial',
                    departure_time: 'now',
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
                totalDuration: route.duration_in_traffic,
                Steps: steps,
                Start: route.start_location,
                End: route.end_location,
            }
            this.places[i].Directions = obj;
            //console.log(obj);
        }
    }

    calculateCenterpoint() {
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

    async findNearBySpots() {
        
        //Default to MAX_SEARCH_RADIUS (10km = ~6.2mi) if searchRadius scaled too much
        if (this.MAX_SEARCH_RADIUS < this.searchRadius)
            this.searchRadius = this.MAX_SEARCH_RADIUS;
        
        //Cost: $0.032 per query
        let apiData = await client.placesNearby({
            params: {
                key: mykey,
                radius: this.searchRadius,// distance in meters
                type: this.type,
                rankby: "prominence",   //sorts results based on their importance
                location: {
                    latitude: this.centerpointCoordinates.lat,
                    longitude: this.centerpointCoordinates.lng,
                }
            }
        })
        
        //Retry logic if ZERO_RESULTS is returned
        if(apiData.data.status == "ZERO_RESULTS") {
            console.log("zero results returned1");

            //Increase search radius by 10%
            this.searchRadius = this.searchRadius * 1.1;

            //Run nearby search API again
            apiData = await client.placesNearby({
                params: {
                    key: mykey,
                    radius: this.searchRadius,// distance in meters
                    type: this.type,
                    rankby: "prominence",   //sorts results based on their importance
                    location: {
                        latitude: this.centerpointCoordinates.lat,
                        longitude: this.centerpointCoordinates.lng,
                    }
                }
            })

            //Retry logic if ZERO_RESULTS is returned again
            if(apiData.data.status == "ZERO_RESULTS") {
                console.log("zero results returned2");
                //Remove user-entered PoI type 
                this.type = "";

                //Run nearby search API again
                apiData = await client.placesNearby({
                    params: {
                        key: mykey,
                        radius: this.searchRadius,// distance in meters
                        type: this.type,
                        rankby: "prominence",   //sorts results based on their importance
                        location: {
                            latitude: this.centerpointCoordinates.lat,
                            longitude: this.centerpointCoordinates.lng,
                        }
                    }
                })
            }

        }

        let possibleMeetUpSpots = [];
        apiData.data.results.forEach(element => {
            if (element.business_status == 'OPERATIONAL') {
                possibleMeetUpSpots.push({
                    name: element.name,
                    coordinates: element.geometry.location,
                    address: element.vicinity,
                })
            }
        })
        //sort possibleMeetUpSpots
        this.nearbySpots = possibleMeetUpSpots.slice(0, 5);
        //return bestMeetUps;
    }

    async balanceDriveTime() {

        //Debug variable to print data after each manipulation of data
        //Open commented dropdown below for index guide
        /*
        0 - all off 
        1 - all on
        10 - starting data
        11 - abstracted coordinates of starting locations for API call
        12 - API call response
        13 - abstracted drive time and coordinates into trip objects
        14 - calculated average drive time
        15 - remaining trip objects after close proximity removal
        16 - calculated average drive time for remaining trip objects
        20 - all changes in looping portion of algorithm 
        */
        let debug = 0;

        //Debug print
        if (debug == 1 || debug == 10){
            console.log("STARTING DATA")
            console.log(this.centerpointCoordinates);
            console.log(this.places);
            console.log("END STARTING DATA\n")
        }

        //Build origin coordinates for API call
        let originCoordinates = [];
        for (let i = 0; i < this.places.length; i++) {
            originCoordinates.push({
                lat: this.places[i].coordinates.lat,
                lng: this.places[i].coordinates.lng,
            })
        }

        //Debug print
        if (debug == 1 || debug == 11) {
            console.log("ABSTRACTED STARTING LOCATION COORDINATES FOR API CALL")
            console.log(originCoordinates);
            console.log("END ABSTRACTED STARTING LOCATION COORDINATES FOR API CALL\n")
        }

        //Make reverse geocode call to snap averaged coordinates to driveable coordinates
        let apiData1 = await client.geocode({
            params: {
                key: mykey,
                latlng: this.centerpointCoordinates.lat + ", " + this.centerpointCoordinates.lng
            }
        })
    
        //Parse for new coordinates
        let adjLat = apiData1.data.results[0].geometry.location.lat;
        let adjLng = apiData1.data.results[0].geometry.location.lng;
        
        //Assign coordinates to class property
        this.centerpointCoordinates.lat = adjLat;
        this.centerpointCoordinates.lng = adjLng;

        //Run Distance Matrix API
        //Cost: $0.01 * count(origins) * count(destinations)
        let apiData2 = await client.distancematrix({
            params: {
                key: mykey,
                units: 'imperial',
                departure_time: 'now',
                destinations: [this.centerpointCoordinates],
                origins: originCoordinates
            }
        })
        let rows = apiData2.data.rows;

        //Debug print
        if (debug == 1 || debug == 12) {
            console.log("API CALL RESPONSE");
            console.log(JSON.stringify(rows, undefined, 4));
            console.log("END API CALL RESPONSE\n");
        }

        //Variable for finding average distance to be used in nearby search radius
        let totalDistance = 0;

        //Parse JSON response for duration in traffic time values and store them for each startingLocation
        let trips = [];
        for (let i = 0; i < rows.length; i++) {
            trips.push({
                time: rows[i].elements[0].duration_in_traffic.value,
                coordinates: originCoordinates[i],
            })

            //Summing total distances for average distance
            totalDistance += rows[i].elements[0].distance.value;
        }

        //Store 10% of average distance to be used for search radius
        this.searchRadius = (totalDistance / rows.length) * 0.1;

        //Debug print
        if (debug == 1 || debug == 13) {
            console.log("ABSTRACED DRIVE TIME AND COORDINATES INTO TRIP OBJECTS")
            console.log(JSON.stringify(trips, undefined, 4));
            console.log("END ABSTRACED DRIVE TIME AND COORDINATES INTO TRIP OBJECTS\n")
        }

        //Calculate average drive time
        let avgTime = 0;
        for (let i = 0; i < trips.length; i++) {
            avgTime += trips[i].time;
        }
        avgTime = avgTime/trips.length;

        //Debug print
        if (debug == 1 || debug == 14) {
            console.log("CALCULATED AVERAGE DRIVE TIME (seconds): " + avgTime + "\n");
        }

        //Remove trips in close proximity to centerpoint
        //Criteria: Remove trip if drive time is less than 50% of avgTime
        for (let i = 0; i < trips.length; i++) {
            if (trips[i].time < 0.5 * avgTime){
                trips.splice(i, 1);
                originCoordinates.splice(i, 1);
            }
        }

        //Debug print
        if (debug == 1 || debug == 15) {
            console.log("REMAINING TRIP OBJECTS AFTER CLOSE PROXIMITY REMOVAL");
            console.log(JSON.stringify(trips, undefined, 4));
            console.log("END REMAINING TRIP OBJECTS AFTER CLOSE PROXIMITY REMOVAL\n");
        }

        //Recalculate average trip time for remaining trip objects
        avgTime = 0;
        for (let i = 0; i < trips.length; i++) {
            avgTime += trips[i].time;
        }
        avgTime = avgTime/trips.length;

        //Debug print
        if (debug == 1 || debug == 16) {
            console.log("RECALCULATED AVERAGE DRIVE TIME (seconds): " + avgTime + "\n");
        }
        
        //Variable setup for looping process
        let count = 0;                              //while loop counter
        let allBalanced = false;                    //flag for if all locations are balanced
        let num = 6;                                //see fraction(below)
        let fraction = 1/num;                       //used to cut distance between centerpoint and furthest location
        let MAX_ITERATIONS = 10;                    //maximum balancing attempts of while loop
        let BALANCE_TOLERANCE = .1;                 //used to determine if locations are within percentage of avg drive time
        let MIN_TOLERANCE = 1 - BALANCE_TOLERANCE;  //see above
        let MAX_TOLERANCE = 1 + BALANCE_TOLERANCE;  //see above

        //Check if drive times are already in a "balanced" state
        //Criteria: All trip times that were not excluded are within BALANCE_TOLERANCE of avgTime
        for (let i = 0; i < trips.length; i++) {
            if ((MIN_TOLERANCE * avgTime) < trips[i].time && trips[i].time < (MAX_TOLERANCE * avgTime)) 
                allBalanced = true;
            else {
                allBalanced = false;

                //Debug print
                if (debug == 1 || debug == 20) {
                    console.log("TRIP TIME DETECTED NOT WITHIN TOLERANCE");
                    console.log("START BALANCING PROCESS\n");
                    console.log("---------------------------------------------------\n")
                }

                break;
            }
        }

        //Debug print
        if (debug == 1 || debug == 20)
            if (allBalanced) {
                console.log("ALL TRIPS ALREADY WITHIN TOLERANCE.  NO BALANCING REQUIRED.");
                console.log("END ALGORITHM");
            }

        //Begin loop to adjust centerpoint and check drive times
        while (count < MAX_ITERATIONS && !allBalanced) {
            
            //Find and store trip with highest drive time
            let maxTimeTrip = trips[0];
            let maxTime = trips[0].time;
            for (let i = 0; i < trips.length; i++) {
                if (trips[i].time > maxTime) {
                    maxTimeTrip = trips[i];
                    maxTime = trips[i].time;
                }
            }

            //Debug print
            if (debug == 1 || debug == 20) {
                console.log("ITERATION: " + count + ",  FRACTION: " + fraction);
                console.log("TRIP WITH HIGHEST DRIVE TIME:\n" + JSON.stringify(maxTimeTrip, undefined, 4));
                console.log("DRIVE TIME VALUE: " + maxTime); 
            }

            //Debug print
            if (debug == 1 || debug == 20) {
                console.log("CENTERPOINT COORDINATES BEFORE SHIFT: " + JSON.stringify(this.centerpointCoordinates));
            }

            //Run interpolate fuction to adjust centerpointCoordinates
            let newCenterpoint = sg.interpolate(this.centerpointCoordinates, maxTimeTrip.coordinates, fraction);
            
            //BUG: Wanted to overwrite the centerpointCoordinates object with the returned LatLng object, however,
            //despite everything looking correct, passing the centerpointCoordinates into the distance matrix api
            //returned a totally unrelated desintation_address.  Parsing directly with lat, lng for now.
            this.centerpointCoordinates.lat = newCenterpoint.lat();
            this.centerpointCoordinates.lng = newCenterpoint.lng();

            //Debug print
            if (debug == 1 || debug == 20) {
                console.log("CENTERPOINT COORDINATES AFTER SHIFT: " + JSON.stringify(this.centerpointCoordinates));
            }
            
            //Run Distance Matrix API
            //Cost: $0.01 * count(origins) * count(destinations)(1) * count(iterations)
            let apiData = await client.distancematrix({
                params: {
                    key: mykey,
                    units: 'imperial',
                    departure_time: 'now',
                    destinations: [this.centerpointCoordinates],
                    origins: originCoordinates
                }
            })
            let rows = apiData.data.rows; 

            //Parse JSON response for duration in traffic time values and overwrite previous value
            for (let i = 0; i < rows.length; i++) {
                trips[i].time = rows[i].elements[0].duration_in_traffic.value;
            }

            //Debug print
            if (debug == 1 || debug == 20) {
                console.log("TRIP OBJECTS WITH NEW DRIVE TIME")
                console.log(JSON.stringify(trips, undefined, 4));
                console.log("END TRIP OBJECTS WITH NEW DRIVE TIME")
            }

            //Recalculate average trip time for remaining trip objects
            avgTime = 0;
            for (let i = 0; i < trips.length; i++) {
                avgTime += trips[i].time;
            }
            avgTime = avgTime/trips.length;

            //Debug print
            if (debug == 1 || debug == 20) {
                console.log("RECALCULATED AVERAGE DRIVE TIME (seconds): " + avgTime);
            }
            
            //Check if drive times are "balanced"
            //Criteria: All trip times that were not excluded are within BALANCE_TOLERANCE of avgTime
            for (let i = 0; i < trips.length; i++) {
                if ((MIN_TOLERANCE * avgTime) < trips[i].time && trips[i].time < (MAX_TOLERANCE * avgTime)) 
                    allBalanced = true;
                else {
                    allBalanced = false;

                    //Debug print
                    if (debug == 1 || debug == 20) {
                        console.log("TRIP WITH TIME NOT WITHIN TOLERANCE:\n" + JSON.stringify(trips[i], undefined, 4));
                        if (count < (MAX_ITERATIONS-1))
                            console.log("END ITERATION: " + count + "\n");
                    }

                    break;
                }
            }

            //Update fraction and counter
            count++;
            num += 2;
            fraction = 1/num;

            //Debug print
            if (debug == 1 || debug == 20) {
                if (allBalanced == true) {
                    console.log("ALL TRIPS WITHIN TOLERANCE.")
                    console.log("END ITERATION: " + (count-1));
                    console.log("END ALGORITHM\n");
                }
                else if (count == MAX_ITERATIONS) {
                    console.log("TRIPS COULD NOT BE BALANCED WITHIN TOLERANCE. MAX ITERATIONS REACHED.")
                    console.log("END ITERATION: " + (count-1));
                    console.log("END ALGORITHM\n");
                }
            }
        }
    }

    async calculateResult() {
        await this.balanceDriveTime();
        await this.findDirections()
        await this.findNearBySpots();
    }

    async returnResult() {
        await this.calculateResult()
        return {
            centerpointCoordinates: this.centerpointCoordinates,
            places: this.places,
            possibleMeetUpSpots: this.nearbySpots,
            searchRadius: this.searchRadius
        }
    }

}

module.exports = Rendeview;