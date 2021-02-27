const {Client} = require("@googlemaps/google-maps-services-js");

// Sample data until we figure out how to transfer data from form into class
sampleLocations = ['Ponce City Market', 'KSU Marietta Campus', 'Six Flags over Georgia'];

class Rendeview {
    // Create array to store location input from text fields
    locationTextFields = [];
    // Create array to store locations' place_ids
    locationPlaceIDs = [];
    // Create "2D" array to store locations' coordinates
    locationCoordinates = [];

    constructor() {
        this.getLocationsFromTextFields();
        this.getLocationData();

    }

    getLocationsFromTextFields() {
        // Temporarily using locations provided above in the sampleLocations array variable
        this.locationTextFields = sampleLocations;
    }

    async getLocationData() {
        // Create GMaps client object
        const client = new Client({});
        

        // Loop through each location and make API call
        for (var i=0; i<this.locationTextFields.length; i++) {
            client
            // Type of API Call - Find Place request (location search query -> place_id)
            .findPlaceFromText({
                // Parameters to pass for API (see GMaps Documentation)
                params: {
                key: "AIzaSyCaZQu6bZp1vVbyZbnI04E8pkzRHhDsanw",
                input: this.locationTextFields[i],
                inputtype: "textquery"
                },
                timeout: 1000, // milliseconds
            })
            // Response handling
            .then((r) => {
                this.locationPlaceIDs.push(r.data.candidates[0].place_id);
            })
            // Error handling
            .catch((e) => {
                console.log(e.response.data);
            });

            // Temporary sleep to ensure data is inserted into array in same order as locationTextFields
            await new Promise(r => setTimeout(r, 1000));
        }

        // Loop through each location and make API call
        for (var i=0; i<this.locationPlaceIDs.length; i++) {
            client
            // Type of API Call - Geocode conversion (place_id -> lat/lng coordinates)
            .geocode({
                // Parameters to pass for API (see GMaps Documentation)
                params: {
                key: "AIzaSyCaZQu6bZp1vVbyZbnI04E8pkzRHhDsanw",
                place_id: this.locationPlaceIDs[i],
                },
                timeout: 1000, // milliseconds
            })
            // Response handling
            .then((r) => {
                var lat = r.data.results[0]['geometry']['location']['lat'];
                var lng = r.data.results[0]['geometry']['location']['lng'];
                this.locationCoordinates.push([lat, lng]);
            })
            // Error handling
            .catch((e) => {
                console.log(e.response.data);
            });

            // Temporary sleep to ensure data is inserted into array in same order as locationTextFields
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    async debugPrint()
    {
        await new Promise(r => setTimeout(r, 10000));
        console.log(this.locationTextFields);
        console.log(this.locationPlaceIDs);
        console.log(this.locationCoordinates);
        
    }
}

let test = new Rendeview();
test.debugPrint();


