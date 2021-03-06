let addButton = document.getElementById('add');
let form = document.getElementById('form');
let submit = document.getElementById('submit');
let defaultInputs = [...document.getElementsByClassName('defaultSearchInputs')]
let script = document.createElement('script');
script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDBpJwKuwvWYmqM3Tk0C1LaBhu6cfrBoKU&callback=initMap&libraries=places&v=weekly"

const options = {
    fields: ['place_id', 'geometry','name']
}
let googleLocations=[];
window.initMap = function () {
    defaultInputs.forEach(element => {
        const autocomplete = new google.maps.places.Autocomplete(element, options);
        googleLocations.push(autocomplete);
    });
};
document.head.appendChild(script);

// let locatinInputs=[...document.querySelectorAll("[name='location'")];
// locatinInputs.forEach(element=>{
//     element.addEventListener('keyup',()=>{
//         console.log(element.value);
//     })
// })


let sendPost = async() => {
    let counter=1;
    let locatinInputs=[...document.querySelectorAll("[name='location'")];
    let data=[];
        googleLocations.forEach(element => {
            let value=locatinInputs[counter-1].value;
            let elementData=element.getPlace();
            if(!elementData||!value) return;
            let nameInputs=document.querySelectorAll("[name='Name'");
        let obj={};
        obj.PersonsName=nameInputs[counter-1].textContent||`Person:${counter}`;
        obj.coordinates={
            lat:elementData.geometry.location.lat(),
            lng:elementData.geometry.location.lng()
        }
        obj.location=elementData.name;
        data.push(obj);
       counter++;
    })
    //console.log(data);
  let newForm=document.createElement('form');
  newForm.method='POST';
  newForm.action='/results'
  let dataInput=document.createElement('input');
  dataInput.type='text';
  dataInput.name='data';
  dataInput.value=JSON.stringify(data);
  newForm.appendChild(dataInput);
 document.body.appendChild(newForm);
 newForm.submit();
}
submit.addEventListener('click',()=>{
    sendPost();
})

form.addEventListener('submit', (event) => {
    event.preventDefault();
})
addButton.addEventListener('click', () => {
    let inputCount = document.getElementsByClassName('addressInfo').length;
    if (inputCount > 9) {
        console.log(`too many addresses`);
        return;
    }
    let newDiv = document.createElement('div');
    newDiv.classList.add('addressInfo');
    let addressLabel = document.createElement('label');
    addressLabel.textContent = `Location:${inputCount + 1}`
    let nameLabel = document.createElement('label');
    nameLabel.textContent = 'Name'
    let newLocation = document.createElement('input');
    newLocation.type = 'text';
    newLocation.style.width = '50%';
    const autocomplete = new google.maps.places.Autocomplete(newLocation, options);
    autocomplete.addListener('place_changed', () => {
        let data = autocomplete.getPlace();
        console.log(autocomplete);
    })
    googleLocations.push(autocomplete);
    newLocation.name = 'location';
    let close = document.createElement('span');
    close.textContent = 'x';
    close.classList.add('close');
    let PersonsName = document.createElement('input');
    PersonsName.name = 'Name';
    close.addEventListener('click', () => {
        close.parentElement.remove();
    });
    newDiv.appendChild(addressLabel);
    newDiv.appendChild(newLocation);
    newDiv.appendChild(nameLabel);
    newDiv.appendChild(PersonsName);
    newDiv.appendChild(close);
    form.insertBefore(newDiv, submit);
})


