"use strict";

// Passed data through ejs render somehow converted data into string, must parseFloat 
let centerpointLat = parseFloat(document.getElementById('latCenter').textContent);
let centerpointLng = parseFloat(document.getElementById('lngCenter').textContent);
let infoDiv = document.getElementById('info');
let locInfo = [...document.getElementsByClassName('placesInfo')];
let displayInfo = [...document.getElementsByClassName('displayInfo')];
let polyline='wbdnEz{zbOMwB@s@He@NgA?o@?MEAQCsBAm@?cA@?y@@cBPqCnBsHH_@z@iDz@iCh@qB~AeFjAgDj@wAV}@b@kCNqBBaBEsAOoBYoAc@wAeBmEs@}A]cAwBkFYs@Ec@Ig@Ce@F_@NUVOVER@PHPRHN@XC^On@Qf@cAhBo@vA_A`BWb@wAvBuBrCgArBU\\aCxFqAnCuDjHyBhEKb@Kj@k@hAcCrEy@nAkAtAu@r@e@`@gAr@iAn@u@\\_Bh@s@NaBVkALy@@_THeEB{BFkAHgALqATaBd@sBp@mCjA{CnBcGpFqBfByEtEgFzEsArAqBlBeD~C}ObOqV`VcNlMyNhN{MjMgGfGiChCmEjEcJbJeA~@_CbCw@t@sDtDoDxDaC~CyBdDyAjC}A`D{AxDwEvLiDhI{@jBsAfCqItOwAhCwAbCoBlCo@v@eBfByApAuAdAqChBcAh@aHdDuU~KsDfBkM|G_GxCu@ZyBx@oBh@sBb@oFz@qNtBkFx@oEl@kFz@uHhAmIpAyCh@qAXwC|@mBv@kAj@gCvAcJhGqMxIsAz@{@TcA^eBn@u@Tk@JaCNwGPcCJqBHUDeAVl@vEn@vFR|A^rBV~@p@bB`ChEq@x@o@x@s@v@g@ZoAh@cATgAJ_G?uKEc@A?NA\\O?mA?M?'
let meetUpSpots=[...document.getElementsByClassName('spot')];
let centerpointMarker;




function initMap() {
    let addMarker=(coordinates,title,name)=>{
        let marker = new google.maps.Marker({
            position: coordinates,
            map,
            title: title,
            label: name,
          })
          return marker;
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
  //console.log(google.maps.geometry.encoding.decodePath(polyline));
  polyline=google.maps.geometry.encoding.decodePath(polyline);
  const path= new google.maps.Polyline({
    path:polyline,
    geodesic:true,
    strokeColor:"FF0000",
    strokeOpacity:1.0,
    strokeWeight:2,
  })
  path.setMap(map);
  for(let i=0; i<meetUpSpots.length;i++){
    let spot=meetUpSpots[i];
    let name= spot.querySelector('.spotName').textContent;
    let title=`Spot${i+1}`
    console.log(`The spot name is ${name}`);
    let coordiantes={
        lat:Number(spot.querySelector('.spotLat').textContent),
        lng:Number(spot.querySelector('.spotLng').textContent),
    }
    addMarker(coordiantes,title,name);
  }


}


