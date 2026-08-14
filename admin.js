import { app, db, storage } from "./firebase.js";

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

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";


const auth = getAuth(app);

const productList =
    document.getElementById("product-list");

const productCount =
    document.getElementById("productCount");


// ======================================
// ADMIN LOGIN CHECK
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

    }

});


// ======================================
// LOGOUT
// ======================================

window.logout = async function () {

    try {

        await signOut(auth);

        window.location.href = "login.html";

    } catch (error) {

        console.error("Logout error:", error);

        alert("Logout failed");

    }

};


// ======================================
// ADD PRODUCT
// ======================================

window.addProduct = async function () {

    const name =
        document.getElementById("name")
            .value
            .trim();

    const price =
        document.getElementById("price")
            .value
            .trim();

    const category =
        document.getElementById("category")
            .value
            .trim();

    const imageInput =
        document.getElementById("image");


    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (!name || !price || !category) {

        alert("Please fill all product details");

        return;

    }


    if (
        !imageInput ||
        !imageInput.files ||
        imageInput.files.length === 0
    ) {

        alert("Please select a product image");

        return;

    }


    const imageFile =
        imageInput.files[0];


    // -------------------------------
    // IMAGE TYPE
    // -------------------------------

    if (!imageFile.type.startsWith("image/")) {

        alert("Please select a valid image");

        return;

    }


    // -------------------------------
    // IMAGE SIZE
    // -------------------------------

    if (imageFile.size > 5 * 1024 * 1024) {

        alert("Image must be less than 5 MB");

        return;

    }


    try {

        const button =
            document.querySelector(".add-btn");


        if (button) {

            button.disabled = true;

            button.innerText =
                "Uploading...";

        }


        // -------------------------------
        // UNIQUE IMAGE NAME
        // -------------------------------

        const fileName =
            `products/${Date.now()}_${imageFile.name}`;


        // -------------------------------
        // STORAGE REFERENCE
        // -------------------------------

        const imageRef =
            ref(storage, fileName);


        // -------------------------------
        // UPLOAD IMAGE
        // -------------------------------

        await uploadBytes(
            imageRef,
            imageFile
        );


        // -------------------------------
        // GET IMAGE URL
        // -------------------------------

        const imageURL =
            await getDownloadURL(imageRef);


        // -------------------------------
        // SAVE PRODUCT
        // -------------------------------

        await addDoc(
            collection(db, "products"),
            {

                name: name,

                price: Number(price),

                category: category,

                image: imageURL,

                createdAt: new Date()

            }
        );


        // -------------------------------
        // CLEAR FORM
        // -------------------------------

        document.getElementById("name")
            .value = "";

        document.getElementById("price")
            .value = "";

        document.getElementById("category")
            .value = "";

        imageInput.value = "";


        alert(
            "Product Added Successfully!"
        );


        await loadProducts();


    } catch (error) {

        console.error(
            "Add product error:",
            error
        );


        alert(
            "Product upload failed!\n\n" +
            error.message
        );


    } finally {

        const button =
            document.querySelector(".add-btn");


        if (button) {

            button.disabled = false;

            button.innerText =
                "Add Product";

        }

    }

};


// ======================================
// LOAD PRODUCTS
// ======================================

async function loadProducts() {

    try {

        productList.innerHTML = `
            <div class="empty-products">
                Loading products...
            </div>
        `;


        const snapshot =
            await getDocs(
                collection(db, "products")
            );


        productList.innerHTML = "";


        if (productCount) {

            productCount.innerText =
                snapshot.size;

        }


        if (snapshot.empty) {

            productList.innerHTML = `
                <div class="empty-products">
                    No Products Found
                </div>
            `;

            return;

        }


        snapshot.forEach((item) => {

            const product =
                item.data();


            productList.innerHTML += `

                <div class="product-card">

                    <img
                        src="${product.image || ""}"
                        alt="${product.name || "Product"}"
                    >

                    <div class="product-info">

                        <h3>
                            ${product.name || ""}
                        </h3>

                        <p>
                            Category:
                            ${product.category || ""}
                        </p>

                        <div class="product-price">
                            ₹${Number(product.price || 0)}
                        </div>

                        <button
                            class="delete-btn"
                            onclick="deleteProduct('${item.id}')"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `;

        });


    } catch (error) {

        console.error(
            "Load products error:",
            error
        );


        productList.innerHTML = `

            <div class="empty-products">

                ❌ Failed to load products

                <br><br>

                ${error.message}

            </div>

        `;

    }

}


// ======================================
// DELETE PRODUCT
// ======================================

window.deleteProduct = async function (id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        await deleteDoc(
            doc(db, "products", id)
        );


        alert(
            "Product deleted successfully!"
        );


        await loadProducts();


    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );


        alert(
            "Delete failed!\n\n" +
            error.message
        );

    }

};


// ======================================
// START
// ======================================

loadProducts();
