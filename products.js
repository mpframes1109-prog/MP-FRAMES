import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const container = document.getElementById("product-container");

let allProducts = [];

// ===============================
// LOAD PRODUCTS FROM FIRESTORE
// ===============================

async function loadProducts() {

    try {

        container.innerHTML = "<p>Loading products...</p>";

        const snapshot = await getDocs(
            collection(db, "products")
        );

        allProducts = [];

        snapshot.forEach((doc) => {

            allProducts.push({
                id: doc.id,
                ...doc.data()
            });

        });

        console.log("Products loaded:", allProducts);

        displayProducts(allProducts);

    } catch (error) {

        console.error("Products loading error:", error);

        container.innerHTML = `
            <div style="text-align:center; padding:30px;">
                <h3>Unable to load products</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()">
                    Retry
                </button>
            </div>
        `;

    }

}


// ===============================
// DISPLAY PRODUCTS
// ===============================

function displayProducts(products) {

    container.innerHTML = "";

    if (products.length === 0) {

        container.innerHTML = `
            <p style="text-align:center;">
                No products available.
            </p>
        `;

        return;
    }


    products.forEach((product) => {

        const card = document.createElement("div");

        card.className = "product";


        card.innerHTML = `

            <img
                src="${product.image || ""}"
                alt="${product.name || "Frame"}"
                onerror="this.src='images/no-image.jpg'"
            >

            <div class="product-content">

                <h3>
                    ${product.name || "Unnamed Frame"}
                </h3>

                <p class="price">
                    ₹${Number(product.price || 0)}
                </p>

                <p>
                    Category:
                    ${product.category || "Photo"}
                </p>

                <button class="add-cart-btn">
                    Add To Cart
                </button>

            </div>

        `;


        const button =
            card.querySelector(".add-cart-btn");


        button.addEventListener("click", () => {

            addToCart(product);

        });


        container.appendChild(card);

    });

}


// ===============================
// ADD TO CART
// ===============================

function addToCart(product) {

    let cart =
        JSON.parse(localStorage.getItem("cart")) || [];


    const existing =
        cart.find(item => item.id === product.id);


    if (existing) {

        existing.quantity =
            (existing.quantity || 1) + 1;

    } else {

        cart.push({

            id: product.id,

            name: product.name || "",

            price: Number(product.price || 0),

            image: product.image || "",

            category: product.category || "",

            quantity: 1

        });

    }


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    updateCartCount();


    alert("Product Added To Cart");

}


// ===============================
// CART COUNT
// ===============================

function updateCartCount() {

    const cart =
        JSON.parse(localStorage.getItem("cart")) || [];


    const count =
        cart.reduce(
            (total, item) =>
                total + (item.quantity || 1),
            0
        );


    const cartCount =
        document.getElementById("cart-count");


    if (cartCount) {

        cartCount.innerText = count;

    }

}


// ===============================
// START
// ===============================

updateCartCount();

loadProducts();
