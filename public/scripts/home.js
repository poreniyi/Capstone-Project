let addButton=document.getElementById('add');
let form=document.getElementById('form');
let submit=document.getElementById('submit');


addButton.addEventListener('click',()=>{
    let inputCount=document.getElementsByClassName('addressInfo').length;
    if(inputCount>9){
        console.log(`too many addresses`);
        return;
    }
    console.log(inputCount);
    let newDiv=document.createElement('div');
    newDiv.classList.add('addressInfo');
    let addressLabel=document.createElement('label');
    addressLabel.textContent=`Location:${inputCount+1}`
    let nameLabel=document.createElement('label');
    nameLabel.textContent='Name'
    let newLocation=  document.createElement('input');
    newLocation.type='text';
    newLocation.name='location';
    newLocation.style.width='50%'
    let close= document.createElement('span');
    close.textContent='x';
    let PersonsName=document.createElement('input');
    PersonsName.name='Name';
    close.addEventListener('click',()=>{
        close.parentElement.remove(); 
    });
    newDiv.appendChild(addressLabel);
    newDiv.appendChild(newLocation);
    newDiv.appendChild(nameLabel);
    newDiv.appendChild(PersonsName);
    newDiv.appendChild(close);
    form.insertBefore(newDiv,submit);
})

