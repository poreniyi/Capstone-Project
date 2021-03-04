"use strict";

// Passed data through ejs render somehow converted data into string, must parseFloat 
let centerpointLat = parseFloat(document.getElementById('latCenter').textContent);
let centerpointLng = parseFloat(document.getElementById('lngCenter').textContent);
let infoDiv = document.getElementById('info');
let locInfo = [...document.getElementsByClassName('locInfo')];
let displayInfo = [...document.getElementsByClassName('displayInfo')];

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
  centerpointMarker = new google.maps.Marker({
    position: myLatLng,
    map,
    title: "Hello World!",
    label: 'Centerpoint'
  });
  let centerpoint=document.getElementById('centerpoint');
  centerpointMarker.addListener('mouseover', () => {
    centerpoint.style.backgroundColor='red' //for future add a css class to style this div and toggle it off in mouseout
  })
  centerpointMarker.addListener('mouseout', () => {
    centerpoint.style.backgroundColor=''
  })
  const radius=new google.maps.Circle({
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
    map,
    center: myLatLng,
    radius: 8046,//in meters
})
  for (let i = 0; i < locInfo.length; i++) {
    let info = locInfo[i];
    let coordinates = info.querySelector('.coordiantes').textContent.split(',');
    let address = info.querySelector('.Address').textContent;
    const LatLng = {
      lat: Number(coordinates[0]),
      lng: Number(coordinates[1])
    }
    let marker = new google.maps.Marker({
      position: LatLng,
      map,
      title: `Address${i + 1}`,
      label: address
    })
    marker.addListener('mouseover', () => {
      displayInfo[i].style.backgroundColor='red' //for future add a css class to style this div and toggle it off in mouseout
    })
    marker.addListener('mouseout', () => {
      displayInfo[i].style.backgroundColor=''
    })
  }

}


