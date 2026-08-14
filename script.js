// Display products on home page
const productContainer = document.getElementById("product-container");

if(productContainer){
    products.forEach(product => {
        productContainer.innerHTML += `
            <div class="product">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-content">
                    <h3>${product.name}</h3>
                    <p class="price">₹${product.price}</p>
                    <button onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
        `;
    });
}

// Add product to cart
function addToCart(id){
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const product = products.find(p => p.id === id);

    cart.push(product);

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

    alert(product.name + " added to cart!");
}

// Update cart count
function updateCartCount(){
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const countElement = document.getElementById("cart-count");

    if(countElement){
        countElement.innerText = cart.length;
    }
}

updateCartCount();
