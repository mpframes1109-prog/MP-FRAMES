import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ======================================
// ELEMENTS
// ======================================

const productContainer =
    document.getElementById("product-container");

const searchInput =
    document.getElementById("search");

const categoryFilter =
    document.getElementById("categoryFilter");


// ======================================
// PRODUCTS
// ======================================

let products = [];


// ======================================
// LOAD PRODUCTS FROM FIREBASE
// ======================================

async function loadProducts() {

    try {

        if (productContainer) {

            productContainer.innerHTML = `
                <p style="text-align:center;">
                    Loading products...
                </p>
            `;

        }


        const snapshot =
            await getDocs(
                collection(db, "products")
            );


        products = [];


        snapshot.forEach((document) => {

            products.push({

                id: document.id,

                ...document.data()

            });

        });


        displayProducts(products);


        updateCategories();


    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );


        if (productContainer) {

            productContainer.innerHTML = `
                <p style="text-align:center;color:red;">
                    Failed to load products.
                    <br><br>
                    ${error.message}
                </p>
            `;

        }

    }

}


// ======================================
// DISPLAY PRODUCTS
// ======================================

function displayProducts(productArray) {

    if (!productContainer) {

        console.error(
            "product-container not found"
        );

        return;

    }


    productContainer.innerHTML = "";


    if (productArray.length === 0) {

        productContainer.innerHTML = `
            <p style="
                text-align:center;
                width:100%;
                padding:30px;
            ">
                No products found.
            </p>
        `;

        return;

    }


    productArray.forEach(product => {

        const card =
            document.createElement("div");


        card.className =
            "product-card";


        card.innerHTML = `

            <img
                src="${product.image || ""}"
                alt="${escapeHTML(product.name || "Frame")}"
                onerror="this.style.display='none'"
            >

            <div class="product-info">

                <h3>
                    ${escapeHTML(product.name || "")}
                </h3>

                <p>
                    ${escapeHTML(product.category || "")}
                </p>

                <h4>
                    ₹${Number(product.price || 0)}
                </h4>

                <button
                    onclick="viewProduct('${product.id}')"
                >
                    View Product
                </button>

                <button
                    onclick="addToCart('${product.id}')"
                >
                    Add to Cart
                </button>

            </div>

        `;


        productContainer.appendChild(card);

    });

}


// ======================================
// VIEW PRODUCT
// ======================================

window.viewProduct =
    function(id) {

        const product =
            products.find(
                item => item.id === id
            );


        if (!product) {

            alert(
                "Product not found"
            );

            return;

        }


        localStorage.setItem(
            "selectedProduct",
            JSON.stringify(product)
        );


        window.location.href =
            "product.html";

    };


// ======================================
// ADD TO CART
// ======================================

window.addToCart =
    function(id) {

        const product =
            products.find(
                item => item.id === id
            );


        if (!product) {

            alert(
                "Product not found"
            );

            return;

        }


        let cart =
            JSON.parse(
                localStorage.getItem("cart")
            ) || [];


        const existing =
            cart.find(
                item => item.id === product.id
            );


        if (existing) {

            existing.quantity =
                (existing.quantity || 1) + 1;

        } else {

            cart.push({

                id: product.id,

                name: product.name,

                price: Number(product.price) || 0,

                image: product.image || "",

                category:
                    product.category || "",

                quantity: 1

            });

        }


        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        updateCartCount();


        alert(
            "Product added to cart!"
        );

    };


// ======================================
// SEARCH + CATEGORY
// ======================================

function filterProducts() {

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const category =
        categoryFilter
            ? categoryFilter.value
            : "";


    const filtered =
        products.filter(product => {

            const name =
                String(
                    product.name || ""
                ).toLowerCase();


            const productCategory =
                String(
                    product.category || ""
                );


            const matchesSearch =
                name.includes(search);


            const matchesCategory =
                !category ||
                productCategory === category;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    displayProducts(filtered);

}


// ======================================
// CATEGORY DROPDOWN
// ======================================

function updateCategories() {

    if (!categoryFilter) {

        return;

    }


    const categories =
        [
            ...new Set(
                products
                    .map(
                        product =>
                            product.category
                    )
                    .filter(Boolean)
            )
        ];


    categoryFilter.innerHTML = `

        <option value="">
            All Categories
        </option>

    `;


    categories.forEach(category => {

        const option =
            document.createElement("option");


        option.value =
            category;


        option.textContent =
            category;


        categoryFilter.appendChild(
            option
        );

    });

}


// ======================================
// CART COUNT
// ======================================

function updateCartCount() {

    const cartCount =
        document.getElementById(
            "cart-count"
        );


    if (!cartCount) {

        return;

    }


    const cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];


    const count =
        cart.reduce(
            (total, item) =>
                total +
                (Number(item.quantity) || 1),
            0
        );


    cartCount.innerText =
        count;

}


// ======================================
// ESCAPE HTML
// ======================================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// ======================================
// EVENTS
// ======================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterProducts
    );

}


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        filterProducts
    );

}


// ======================================
// START
// ======================================

loadProducts();

updateCartCount();
