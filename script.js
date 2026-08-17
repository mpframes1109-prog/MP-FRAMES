// Load products
const productContainer = document.getElementById("product-container");

if (productContainer) {
    products.forEach(product => {

        productContainer.innerHTML += `
        <div class="product">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-content">
                <h3>${product.name}</h3>
                <p class="price">₹${product.price}</p>

                <button onclick="addToCart(${product.id})">
                    Add To Cart
                </button>
            </div>
        </div>
        `;

    });
}

// Get Cart
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Add To Cart
function addToCart(id){

    const product = products.find(item => item.id === id);

    cart.push(product);

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

    alert("Product Added To Cart");
}

// Cart Count
function updateCartCount(){

    const count = document.getElementById("cart-count");

    if(count){
        count.innerText = cart.length;
    }

}

function goBack() {

    if (document.referrer) {
        history.back();
    } else {
        window.location.href = "index.html";
    }

}
updateCartCount();
