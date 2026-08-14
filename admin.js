import { app, db } from "./firebase.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const auth = getAuth(app);

const productList = document.getElementById("product-list");


// ===============================
// ADMIN LOGIN CHECK
// ===============================

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
    }

});


// ===============================
// LOAD PRODUCTS
// ===============================

async function loadProducts() {

    if (!productList) return;

    productList.innerHTML = "<p>Loading products...</p>";

    try {

        const snapshot =
            await getDocs(collection(db, "products"));

        productList.innerHTML = "";

        if (snapshot.empty) {

            productList.innerHTML =
                "<p>No products available.</p>";

            return;
        }


        snapshot.forEach((document) => {

            const product = document.data();

            productList.innerHTML += `

                <div class="card">

                    <img
                        src="${product.image || ""}"
                        width="150"
                        height="150"
                        style="object-fit:cover;border-radius:8px;"
                    >

                    <h3>
                        ${product.name || ""}
                    </h3>

                    <p>
                        <b>Category:</b>
                        ${product.category || ""}
                    </p>

                    <p>
                        <b>Price:</b>
                        ₹${product.price || 0}
                    </p>

                    <button
                        onclick="deleteProduct('${document.id}')">
                        Delete
                    </button>

                </div>

            `;

        });

    }
    catch (error) {

        console.error(
            "Load products error:",
            error
        );

        productList.innerHTML =
            "<p>Failed to load products.</p>";
    }

}


// ===============================
// ADD PRODUCT
// ===============================

window.addProduct = async function () {

    const name =
        document.getElementById("name").value.trim();

    const price =
        document.getElementById("price").value.trim();

    // IMPORTANT:
    // admin.html uses imagefile
    const image =
        document.getElementById("imagefile").value.trim();

    const category =
        document.getElementById("category").value;


    if (!name || !price || !image || !category) {

        alert("Please fill all fields");

        return;
    }


    try {

        await addDoc(
            collection(db, "products"),
            {

                name: name,

                price: Number(price),

                image: image,

                category: category,

                createdAt: new Date()

            }
        );


        document.getElementById("name").value = "";

        document.getElementById("price").value = "";

        document.getElementById("imagefile").value = "";

        document.getElementById("category").value = "";


        alert("Product Added Successfully");


        loadProducts();

    }
    catch (error) {

        console.error(
            "Add product error:",
            error
        );

        alert(
            "Product add failed:\n" +
            error.message
        );

    }

};


// ===============================
// DELETE PRODUCT
// ===============================

window.deleteProduct = async function (id) {

    if (!confirm("Delete this product?")) {
        return;
    }


    try {

        await deleteDoc(
            doc(db, "products", id)
        );

        alert("Product Deleted");

        loadProducts();

    }
    catch (error) {

        console.error(
            "Delete product error:",
            error
        );

        alert(
            "Delete failed:\n" +
            error.message
        );

    }

};


// ===============================
// LOGOUT
// ===============================

window.logout = async function () {

    try {

        await signOut(auth);

        window.location.href = "login.html";

    }
    catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

};


// ===============================
// START
// ===============================

loadProducts();
