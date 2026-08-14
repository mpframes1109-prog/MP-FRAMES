import { app, db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const productList = document.getElementById("product-list");

// Load Products
async function loadProducts() {

    productList.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "products"));

    querySnapshot.forEach((document) => {

        const product = document.data();

        productList.innerHTML += `
        <div class="card">
            <img src="${product.image}" width="150">

            <h3>${product.name}</h3>

            <p>₹${product.price}</p>

            <button onclick="deleteProduct('${document.id}')">
            Delete
            </button>

        </div>
        `;
    });

}

loadProducts();
