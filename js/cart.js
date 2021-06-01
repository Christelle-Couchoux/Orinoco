// create cart table

function createCart() {
    // get stored data from local storage
    let storedOrders = JSON.parse(localStorage.getItem('ordersList'));
    //console.log(storedOrders);

    if(storedOrders === null || storedOrders.length === 0) {
        cartIsEmptyMessage(); // call function to show a 'Votre panier est vide !' message
    } else {
        for(let storedOrder of storedOrders) { // for each order in the array
            const tbody = document.getElementById('cart-tablebody'); // in the table

            // add one row
            const tr = tbody.appendChild(document.createElement('tr'));

            // add and fill in name cell
            const tdName = tr.appendChild(document.createElement('td'));
            tdName.classList.add('td-name', 'align-left');
            tdName.innerText = storedOrder.cameraName;

            // add and fill in lens cell
            const tdLens = tr.appendChild(document.createElement('td'));
            tdLens.classList.add('td-lens');
            tdLens.innerText = storedOrder.cameraLens;

            // add and fill in price cell
            const tdPrice = tr.appendChild(document.createElement('td'));
            tdPrice.classList.add('td-price', 'align-right');
            tdPrice.innerText = storedOrder.cameraPrice + ' €';

            // add and fill in quantity cell
            const tdQuantity = tr.appendChild(document.createElement('td'));
            tdQuantity.classList.add('td-quantity');
            tdQuantity.innerText = storedOrder.cameraQuantity;

            // add and fill in total cell
            const tdTotal = tr.appendChild(document.createElement('td'));
            tdTotal.classList.add('td-total', 'align-right');
            tdTotal.innerText = storedOrder.cameraPrice * storedOrder.cameraQuantity + ' €';
        }
        priceCalculation(storedOrders); // call function to calculate total price
    }   
};


// show 'Votre panier est vide !' message

function cartIsEmptyMessage(){
    const error = document.createElement('div'); // create div error
    error.classList.add('error'); // with class="error" to add css style
    error.innerText = 'Votre panier est vide !'; // with error message text

    const table = document.getElementById('continue').parentNode; // get parent of element before which to insert
    const btnContinue = document.getElementById('continue'); // get element before which to insert
    table.insertBefore(error, btnContinue); // in element parent, insert error before btnContinue
}


// calculate total price
function priceCalculation(storedOrders) {

    // put all prices in an array
    let pricesArray = [];
    for(let storedOrder of storedOrders) { // for each order stored
        let price = storedOrder.cameraPrice * storedOrder.cameraQuantity; // get the price of the product * the quantity
        pricesArray.push(price); // put it in the array
    };
    //console.log(pricesArray);

    // add up all the prices
    const totalPrice = pricesArray.reduce(addUp,0); // function reduce executes function addUp
    //console.log(totalPrice);

    // fill in total price cell
    const thTotal = document.getElementById('total'); // in total price cell
    thTotal.innerText = totalPrice + ' €'; // add price in euros

    storeTotalPrice(totalPrice); // call function to store total price
}


// add up prices of all the products in the order

/* currentValue is each value in the array in turn
return value (sum) is put in accumulator for next iteration
reduce() execute the function addUp, from index 0 */
function addUp(accumulator, currentValue) {
    return (accumulator + currentValue);
}


// store totalPrice in local storage

function storeTotalPrice(totalPrice) {
    localStorage.setItem('orderTotal', JSON.stringify(totalPrice));
    //console.log(totalPrice);
}


////////////


// continue shopping

function continueShopping() {
    const btnContinue = document.getElementById('continue');

    btnContinue.addEventListener('click', function(event) { // listen to 'continuer mes achats' button
        window.location.href = 'index.html'; // go back to home page
    });
}


////////////


// empty cart

function emptyCart() {
    const btnEmpty = document.getElementById('empty');

    btnEmpty.addEventListener('click', function(event) { // listen to 'vider le panier' button
        localStorage.removeItem('ordersList'); // remove array with stored orders
        //console.log(storedOrders);
        window.location.href = 'cart.html'; // reload the page so changes taken into account
    });
}


////////////


// validate order

function validateOrder() {
    const btnSubmit = document.getElementById('submit');
    storedOrders = JSON.parse(localStorage.getItem('ordersList'));

    // listen to 'valider ma commande' button
    btnSubmit.addEventListener('click', function(event) {
        event.preventDefault();
        createContact(); // call function to create object contact
    })
}


// create object 'contact'

function createContact(contact) {
    const firstname = document.getElementById('firstname');
    const lastname = document.getElementById('lastname');
    const address = document.getElementById('address');
    const city = document.getElementById('city');
    const email = document.getElementById('email');

    const isValidFirstName = firstname.checkValidity();
    const isValidLastName = lastname.checkValidity();
    const isValidAddress = address.checkValidity();
    const isValidCity = city.checkValidity();
    const isValidEmail = email.checkValidity();

    console.log(isValidFirstName, isValidLastName, isValidAddress, isValidCity, isValidEmail);

    if(isValidFirstName && isValidLastName && isValidAddress && isValidCity && isValidEmail) {
        
        // create contact
        // declare class ContactToSend
        class ContactToSend {
            constructor(firstName, lastName, address, city, email) {
                this.firstName = firstName;
                this.lastName = lastName;
                this.address = address;
                this.city = city;
                this.email = email;
            }
        }  
        // create new instance of class ContactToSend  
        let contact = new ContactToSend(firstname.value, lastname.value, address.value, city.value, email.value);
        //console.log(contact);

        createProducts(storedOrders, contact); // call function to create products array
    } else {
        alert('Tous les champs du formulaire doivent être remplis et valides.');
    }
}


// create products array

function createProducts(storedOrders, contact) {
    storedOrders = JSON.parse(localStorage.getItem('ordersList'));
    //console.log(storedOrders);

    let products = [];
    for(let storedOrder of storedOrders) {
        let productId = storedOrder.cameraId;
        products.push(productId);
    }
    //console.log(products);

    createObjectToSend(contact, products); // call function to create object with contact and products
}


// create object with contact + products array

function createObjectToSend(contact, products) {
    let objectToSend = {
        contact,
        products
    }
    //console.log(objectToSend);

    send(objectToSend); // call function to send data to server
}


// send data to server

function send(objectToSend) {
    fetch('http://localhost:3000/api/cameras/order', {
        method : "POST",
        headers : {
            'Accept' : 'application/json',
            'Content-type' : 'application/json',
        },
        body : JSON.stringify(objectToSend)
    })

    .then(function(response) {
        if (response.ok) { // if response ok
            return response.json(); // return response (promise)
        }
    })

    .then(function(serverResponse) { // resolved promise
        //console.log(serverResponse); // print object
        storeOrderId(serverResponse); // call function
    })

    .catch(function(err) {
        console.error('Erreur lors de la requête : ', err); // print error message in console
        const model = document.getElementById('model'); // in div id="model"
        const error = model.appendChild(document.createElement('div')); // create div error
        error.classList.add('error'); // with class="error" to add css style
        error.innerText = 'Une erreur est survenue lors de la réponse serveur.'; // with error message text
    });
}


// store order id

function storeOrderId(data) {
    const storedOrderId = localStorage.setItem('orderId', data.orderId);
    //console.log(storedOrderId);
    window.location = 'confirm.html';
    localStorage.removeItem('OrdersList')
}


////////////


// call functions

continueShopping(); // needs to be called first so works even if cart empty
createCart();
emptyCart();
validateOrder();
