let products = JSON.parse(localStorage.getItem("products")) || [];

function addProduct() {

    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const image = document.getElementById("image").value;

    if (!name || !price || !image) {
        alert("Fill all fields");
        return;
    }

    products.push({
        id: Date.now(),
        name,
        price,
        image
    });

    localStorage.setItem("products", JSON.stringify(products));

    displayProducts();

    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("image").value = "";
}

function displayProducts() {

    const list = document.getElementById("product-list");

    list.innerHTML = "";

    products.forEach((product, index) => {

        list.innerHTML += `
        <div style="border:1px solid #ddd;padding:15px;margin:15px;max-width:500px;">
            <img src="${product.image}" width="100"><br><br>

            <b>${product.name}</b><br>

            ₹${product.price}<br><br>

            <button onclick="deleteProduct(${index})">
            Delete
            </button>
        </div>
        `;

    });

}

function deleteProduct(index){

    products.splice(index,1);

    localStorage.setItem("products", JSON.stringify(products));

    displayProducts();

}

displayProducts();
