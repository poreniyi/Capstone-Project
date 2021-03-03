"use strict";

        // Passed data through ejs render somehow converted data into string, must parseFloat 
       let centerpointLat= parseFloat(document.getElementById('latCenter').textContent);
       let centerpointLng= parseFloat(document.getElementById('lngCenter').textContent);

        function initMap() {
          const myLatLng = {
            lat: centerpointLat,
            lng: centerpointLng
          };
          const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 13,
            center: myLatLng,
            fullscreenControl: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false
          });
          new google.maps.Marker({
            position: myLatLng,
            map,
            title: "Hello World!",
            label:'Centerpoint'
          });
        }
