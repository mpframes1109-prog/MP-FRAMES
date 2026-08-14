// Load existing products
let products = JSON.parse(localStorage.getItem("products")) || [];

// Display products when page loads
displayProducts();

// Add Product
function addProduct() {

    let name = document.getElementById("name").value.trim();
    let price = document.getElementById("price").value.trim();
    let image = document.getElementById("image").value.trim();

    if (name === "" || price === "" || image === "") {
        alert("Please fill all fields.");
        return;
    }

    const product = {
        id: Date.now(),
        name: name,
        price: Number(price),
        image: image
    };

    products.push(product);

    localStorage.setItem("products", JSON.stringify(products));

    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("image").value = "";

    displayProducts();

    alert("Product Added Successfully!");
}

// Display Products
function displayProducts() {

    const list = document.getElementById("product-list");

    list.innerHTML = "";

    if (products.length === 0) {
        list.innerHTML = "<p>No Products Available</p>";
        return;
    }

    products.forEach((product, index) => {

        list.innerHTML += `
        <div style="
            background:#fff;
            padding:15px;
            border-radius:10px;
            box-shadow:0 0 10px rgba(0,0,0,.1);
            text-align:center;
        ">
            <img src="${product.image}"
                 style="width:100%;height:180px;object-fit:cover;border-radius:8px;">

            <h3>${product.name}</h3>

            <p><strong>₹${product.price}</strong></p>

            <button onclick="deleteProduct(${index})"
            style="background:red;color:white;">
            Delete
            </button>
        </div>
        `;
    });

}

// Delete Product
function deleteProduct(index){

    if(confirm("Delete this product?")){

        products.splice(index,1);

        localStorage.setItem("products",JSON.stringify(products));

        displayProducts();

    }

}
