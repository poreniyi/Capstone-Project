const {Client} = require("@googlemaps/google-maps-services-js");
require('dotenv').config();// if file ever moved need to change path
let mykey = process.env.GMaps_Key;

// Sample data until we figure out how to transfer data from form into class
sampleLocations = ['Ponce City Market', 'KSU Marietta Campus', 'Six Flags over Georgia'];

class Rendeview {
    // Create array to store location input from text fields
    locationTextFields = [];
    // Create array to store locations' place_ids
    locationPlaceIDs = [];
    // Create "2D" array to store locations' coordinates
    locationCoordinates = [];
    // Create array to store centerpoint coordinates
    centerpointCoordinates = [];

    constructor(arrayLocations) {
        this.getLocationsFromTextFields(arrayLocations);
        this.getLocationData();
        this.calculateCenterpoint();
    }

    getLocationsFromTextFields(arrayLocations) {
        // Temporarily using locations provided above in the sampleLocations array variable
        this.locationTextFields = arrayLocations;
    }

    // Idea to address async/await: Split function into singular request and then aggregate responses in another function
    async getLocationData() {
        // Create GMaps client object
        const client = new Client({});
        // Loop through each location and make API call
        for (let i=0; i<this.locationTextFields.length; i++) {
            try{
                let r=await client.findPlaceFromText({
                    params:{
                        key:mykey,
                        input:this.locationTextFields[i],
                        inputtype:"textquery"
                    },
                    timeout:1000})
            this.locationPlaceIDs.push(r.data.candidates[0].place_id);
            }catch(e){
                console.log(e.response.data);
            }
        }

        // Loop through each location and make API call
        for (let i=0; i<this.locationPlaceIDs.length; i++) {
            try{
                let r=await client.geocode({
                    params:{
                        key:mykey,
                        place_id: this.locationPlaceIDs[i],
                    },timeout:1000})
                    let lat = r.data.results[0]['geometry']['location']['lat'];
                    let lng = r.data.results[0]['geometry']['location']['lng'];
                    this.locationCoordinates.push([lat, lng]);
            }catch(e){
                console.log(e);
            }
        }
    }

    async calculateCenterpoint() {
        // Sleep until all GMaps get requests to fill arrays are done
        await new Promise(r => setTimeout(r, 3000));

        let totalLat = 0;
        let totalLng = 0;
        
        for (let i=0; i<this.locationCoordinates.length; i++) {
            totalLat += this.locationCoordinates[i][0];
            totalLng += this.locationCoordinates[i][1];
        }

        let avgLat = totalLat/this.locationCoordinates.length;
        let avgLng = totalLng/this.locationCoordinates.length;

        this.centerpointCoordinates = [avgLat, avgLng];
    }

    async debugPrint() {
        await new Promise(r => setTimeout(r, 5000));
        console.log(this.locationTextFields);
        console.log(this.locationPlaceIDs);
        console.log(this.locationCoordinates);
        console.log(this.centerpointCoordinates)
    }

    async exportCoordinates() {
        await new Promise(r => setTimeout(r, 5000));
        return this.centerpointCoordinates;
    }

}

// let test = new Rendeview(sampleLocations);
// test.debugPrint();

module.exports = Rendeview;