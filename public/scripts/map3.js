"use strict";

// Passed data through ejs render somehow converted data into string, must parseFloat 
let centerpointLat = parseFloat(document.getElementById('latCenter').textContent);
let centerpointLng = parseFloat(document.getElementById('lngCenter').textContent);
let places = [...document.getElementsByClassName('individualPlace')];
let polyline='wbdnEz{zbOMwB@s@He@NgA?o@?MEAQCsBAm@?cA@?y@@cBPqCnBsHH_@z@iDz@iCh@qB~AeFjAgDj@wAV}@b@kCNqBBaBEsAOoBYoAc@wAeBmEs@}A]cAwBkFYs@Ec@Ig@Ce@F_@NUVOVER@PHPRHN@XC^On@Qf@cAhBo@vA_A`BWb@wAvBuBrCgArBU\\aCxFqAnCuDjHyBhEKb@Kj@k@hAcCrEy@nAkAtAu@r@e@`@gAr@iAn@u@\\_Bh@s@NaBVkALy@@_THeEB{BFkAHgALqATaBd@sBp@mCjA{CnBcGpFqBfByEtEgFzEsArAqBlBeD~C}ObOqV`VcNlMyNhN{MjMgGfGiChCmEjEcJbJeA~@_CbCw@t@sDtDoDxDaC~CyBdDyAjC}A`D{AxDwEvLiDhI{@jBsAfCqItOwAhCwAbCoBlCo@v@eBfByApAuAdAqChBcAh@aHdDuU~KsDfBkM|G_GxCu@ZyBx@oBh@sBb@oFz@qNtBkFx@oEl@kFz@uHhAmIpAyCh@qAXwC|@mBv@kAj@gCvAcJhGqMxIsAz@{@TcA^eBn@u@Tk@JaCNwGPcCJqBHUDeAVl@vEn@vFR|A^rBV~@p@bB`ChEq@x@o@x@s@v@g@ZoAh@cATgAJ_G?uKEc@A?NA\\O?mA?M?'
let meetUpSpots=[...document.getElementsByClassName('spot')];
let centerpointMarker;




function initMap() {
    let addMarker=(coordinates,title,label)=>{
        let marker = new google.maps.Marker({
            position: coordinates,
            map,
            title: title,
            label: label,
          })
          return marker;
      }
    let makePolyline=(polyline)=>{
        const path= new google.maps.Polyline({
            path:polyline,
            geodesic:true,
            strokeColor:"FF0000",
            strokeOpacity:1.0,
            strokeWeight:2,
          })
          return path;
    }
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
  let centerpoint=document.getElementById('Centerpoint');
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
    fillOpacity: 0.00,
    map,
    center: myLatLng,
    radius:1609.34,//1mile in meters
})
  for (let i = 0; i < places.length; i++) {
    let place = places[i];
    let Address=place.querySelector('.Address').textContent
    let PersonsName=place.querySelector('.PersonsName').textContent
    const coordinates = {
      lat: Number(place.querySelector('.lat').textContent),
      lng: Number(place.querySelector('.lng').textContent)
    }
    let marker=addMarker(coordinates,Address,PersonsName);
    let polylineText=place.querySelector('.Polyline').textContent;
    polylineText=google.maps.geometry.encoding.decodePath(polylineText);
    console.log(polylineText);
    let polyline=makePolyline(polylineText);
    polyline.set(map);
    place.addEventListener('mouseover',()=>{
        marker.setAnimation(google.maps.Animation.BOUNCE);
    })
    place.addEventListener('mouseout',()=>{
        marker.setAnimation(null);
    })
    marker.addListener('mouseover', () => {
        place.style.backgroundColor='red' //for future add a css class to style this div and toggle it off in mouseout
    })
    marker.addListener('mouseout', () => {
        place.style.backgroundColor=''
    })
  }
  for(let i=0; i<meetUpSpots.length;i++){
    let spot=meetUpSpots[i];
    let name= spot.querySelector('.spotName').textContent;
    let title=`Spot${i+1}`
    let coordiantes={
        lat:Number(spot.querySelector('.spotLat').textContent),
        lng:Number(spot.querySelector('.spotLng').textContent),
    }
    addMarker(coordiantes,title,name);
  }


}


