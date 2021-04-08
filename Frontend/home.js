  function add(type) {
  
    //Create an input type dynamically.
    var element = document.createElement("input");
  
    //Assign different attributes to the element.
    element.setAttribute("text", type);
    element.setAttribute("location", id);
    element.setAttribute("Enter Address or Zipcode", placeholder);
  
  
    var foo = document.getElementById("location");
  
    //Append the element in page (in span).
    foo.appendChild(element);
  
  }
