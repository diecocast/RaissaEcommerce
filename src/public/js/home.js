const socket = io();
socket.on('list',data=>{
    let products = document.getElementById('ProductsList');
    let modals = document.getElementById('Modals')
    let listProducts = "";
    let listModals = "";
    Array.from(data).forEach(product => {
        if(!product.id) return ''
        listProducts = listProducts+`
        <div data-aos="zoom-out-right" class="col-md-4">
        <div class="product-item">
            <div class="product-thumb">
                <img class="img-responsive" src="img/${product.thumbnail}" alt="product-img" width="500" height="600" />
                <div class="preview-meta">
                    <ul>
                        <li>
                            <span  data-toggle="modal" data-target="#product-modal-${product.id}">
                                <i class="tf-ion-ios-search-strong"></i>
                            </span>
                        </li>

                        <li>
                        <input class="addCartProduct" type="image" src="img/cart.jpg" name="pid-${product.id}" value="${product.id}" onclick="addCartProduct('pid-${product.id}')"/>
                        </li>
                    </ul>
                  </div>
            </div>
            <div class="product-content">
                <h4><a href="product-single.html">${product.name}</a></h4>
                <p class="price">$ ${product.price}</p>
            </div>
        </div>
    </div>`
    listModals = listModals + `
    <div class="modal product-modal fade" id="product-modal-${product.id}">
			<button type="button" class="close" data-dismiss="modal" aria-label="Close">
				<i class="tf-ion-close"></i>
			</button>
		  	<div class="modal-dialog " role="document">
		    	<div class="modal-content">
			      	<div class="modal-body">
			        	<div class="row">
			        		<div class="col-md-8 col-sm-6 col-xs-12">
			        			<div class="modal-image">
				        			<img class="img-responsive" src="/img/${product.thumbnail}" alt="product-img" />
			        			</div>
			        		</div>
			        		<div class="col-md-4 col-sm-6 col-xs-12">
			        			<div class="product-short-details">
			        				<h2 class="product-title">${product.name}</h2>
			        				<p class="product-price">$ ${product.price}</p>
			        				<p class="product-short-description">
                                    ${product.description}
			        				</p>
                                    
			        				<a href="https://api.whatsapp.com/message/7CFR37A5A546H1?autoload=1&app_absent=0" class="btn btn-transparent">Preguntar por mas detalles</a>
			        			</div>
			        		</div>
			        	</div>
			        </div>
		    	</div>
		  	</div>
		</div>`
    });
    modals.innerHTML = listModals;
    products.innerHTML = listProducts;
})

socket.on('cartData', data =>{
    let cartlist = document.getElementById('itemsCart')
    let list = ''
    const valueBtn = document.getElementById('validationID').value
    if(valueBtn == 'Guess' || data.listCart.length === 0){


        list = `
        <div class="media">
        <a class="pull-left" href="#!">
            <img class="media-object" src="/img/dontproducts.png" alt="image" />
        </a>
        <div class="media-body">
            <br><h4 class="media-heading"><a href="#!">No tienes productos agregados</a></h4>
        </div>
    </div>`
        cartlist.innerHTML = list;

        
    }

    if(valueBtn == data.cid & data.listCart.length > 0){
        Array.from(data.listCart).forEach(product => {
            if(!product.id) return ''
            list = list + `
            <div class="media">
            <a class="pull-left" href="#!">
                <img class="media-object" src="/img/${product.thumbnail}" alt="image" />
            </a>
            <div class="media-body">
                <h4 class="media-heading"><a href="#!">${product.name}</a></h4>
                <div class="cart-price">
                    <span>X</span>
                    <span>${product.quantity}</span>
                </div>
                <h5><strong>$ ${product.price}</strong></h5>
            </div>
            <input type="image" name="pid-${product.id}" value="${product.id}" onclick="deleteCartProduct('pid-${product.id}')" class="remove" src="img/deleteProduct.png"/>
        </div>`
        })

        list = list + `
        <span><b>Total: </b></span>
        <span class="total-price">$${data.total}</span>
        <ul class="text-center cart-buttons">
            <li><form action="api/carts/endshop" method="post"><button type="submit" class="btn btn-success" onclick="">Finalizar compra</button></form></li>
        </ul>
        `
        cartlist.innerHTML = list;
    }

})


function addCartProduct(name) {
    const pid = document.querySelector(`input[name=${name}]`).value;
    const data = { pid };
    fetch('/api/carts/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(result=>result.json())
    .then(json=>{
        console.log(json)

        if (json.status == 'Error') {
            window.location.href = "/login";
        } 

    });
}

function deleteCartProduct(name) {
    const pid = document.querySelector(`input[name=${name}]`).value;
    const data = { pid };
    fetch('/api/carts/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
}
