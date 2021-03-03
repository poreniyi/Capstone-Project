"use strict";

// Passed data through ejs render somehow converted data into string, must parseFloat 
let centerpointLat = parseFloat(document.getElementById('latCenter').textContent);
let centerpointLng = parseFloat(document.getElementById('lngCenter').textContent);
let infoDiv=document.getElementById('info');
let locInfo=[...document.getElementsByClassName('locInfo')];
let centerpointMarker;
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
   centerpointMarker=new google.maps.Marker({
    position: myLatLng,
    map,
    title: "Hello World!",
    label: 'Centerpoint'
  });
  for(let i=0;i<locInfo.length;i++){
    let info=locInfo[i];
    let coordinates=info.querySelector('.coordiantes').textContent.split(',');
    let address=info.querySelector('.Address').textContent;
      const LatLng={
        lat:Number(coordinates[0]),
        lng:Number(coordinates[1])
      }
      new google.maps.Marker({
        position: LatLng,
        map,
        title: `Address${i+1}`,
        label: address
      })
  }
  centerpointMarker.addListener('click',()=>{
    console.log('clicked');
  })
}


