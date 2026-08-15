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


// ==========================================
// ADMIN AUTH
// ==========================================

const auth = getAuth(app);


// ==========================================
// CLOUDINARY
// ==========================================

const CLOUDINARY_CLOUD_NAME = "dqavm3wk";

const CLOUDINARY_UPLOAD_PRESET = "mpframes";


// ==========================================
// AUTH CHECK
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }

    console.log(
        "Admin logged in:",
        user.uid
    );

    loadProducts();

});


// ==========================================
// ELEMENT
// ==========================================

const productList =
    document.getElementById("product-list");


// ==========================================
// UPLOAD PRODUCT IMAGE
// ==========================================

async function uploadProductImage(file) {

    if (
        !CLOUDINARY_CLOUD_NAME ||
        CLOUDINARY_CLOUD_NAME === "dqavm3wk"
    ) {

        throw new Error(
            "Cloudinary Cloud Name is not configured."
        );

    }


    if (!file) {

        throw new Error(
            "Please select a product image."
        );

    }


    const uploadURL =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    const response =
        await fetch(
            uploadURL,
            {
                method: "POST",
                body: formData
            }
        );


    const data =
        await response.json();


    console.log(
        "Cloudinary response:",
        data
    );


    if (!response.ok) {

        throw new Error(
            data.error?.message ||
            "Image upload failed."
        );

    }


    if (!data.secure_url) {

        throw new Error(
            "Cloudinary image URL not received."
        );

    }


    return data.secure_url;

}


// ==========================================
// ADD PRODUCT
// ==========================================

window.addProduct =
    async function () {


        const nameInput =
            document.getElementById("name");


        const priceInput =
            document.getElementById("price");


        const imageInput =
            document.getElementById("image");


        const name =
            nameInput?.value.trim();


        const price =
            priceInput?.value.trim();


        // IMPORTANT:
        // File input uses .files[0]

        const imageFile =
            imageInput?.files?.[0];


        // ======================================
        // VALIDATION
        // ======================================

        if (!name) {

            alert(
                "Please enter product name."
            );

            nameInput?.focus();

            return;

        }


        if (!price) {

            alert(
                "Please enter product price."
            );

            priceInput?.focus();

            return;

        }


        if (!imageFile) {

            alert(
                "Please select a product image."
            );

            imageInput?.focus();

            return;

        }


        if (
            !imageFile.type.startsWith("image/")
        ) {

            alert(
                "Please select a valid image file."
            );

            return;

        }


        // Maximum 5 MB

        if (
            imageFile.size >
            5 * 1024 * 1024
        ) {

            alert(
                "Image must be less than 5 MB."
            );

            return;

        }


        const button =
            document.querySelector(
                'button[onclick="addProduct()"]'
            );


        try {


            if (button) {

                button.disabled =
                    true;

                button.innerText =
                    "Uploading Image...";

            }


            // ======================================
            // CLOUDINARY
            // ======================================

            const imageURL =
                await uploadProductImage(
                    imageFile
                );


            console.log(
                "Product image URL:",
                imageURL
            );


            // ======================================
            // FIRESTORE
            // ======================================

            if (button) {

                button.innerText =
                    "Saving Product...";

            }


            const productData = {

                name:
                    name,

                price:
                    Number(price),

                image:
                    imageURL,

                createdAt:
                    new Date()

            };


            const productRef =
                await addDoc(
                    collection(
                        db,
                        "products"
                    ),
                    productData
                );


            console.log(
                "Product added:",
                productRef.id
            );


            // ======================================
            // CLEAR FORM
            // ======================================

            if (nameInput) {

                nameInput.value = "";

            }


            if (priceInput) {

                priceInput.value = "";

            }


            if (imageInput) {

                imageInput.value = "";

            }


            alert(
                "Product Added Successfully! ✅"
            );


            // ======================================
            // RELOAD
            // ======================================

            await loadProducts();


        }
        catch (error) {

            console.error(
                "Add product error:",
                error
            );


            alert(
                "Product upload failed.\n\n" +
                error.message
            );

        }
        finally {

            if (button) {

                button.disabled =
                    false;

                button.innerText =
                    "Add Product";

            }

        }

    };


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    if (!productList) {

        console.error(
            "product-list not found."
        );

        return;

    }


    productList.innerHTML = `

        <p style="
            text-align:center;
            padding:20px;
        ">
            Loading products...
        </p>

    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        if (snapshot.empty) {

            productList.innerHTML = `

                <p style="
                    text-align:center;
                    padding:20px;
                ">
                    No products found.
                </p>

            `;

            return;

        }


        productList.innerHTML = "";


        snapshot.forEach((item) => {

            const product =
                item.data();


            const card =
                document.createElement("div");


            card.style.cssText = `

                background:white;
                padding:15px;
                border-radius:10px;
                text-align:center;
                box-shadow:0 0 10px rgba(0,0,0,.1);

            `;


            const image =
                document.createElement("img");


            image.src =
                product.image || "";


            image.alt =
                product.name || "Product";


            image.style.cssText = `

                width:180px;
                height:180px;
                object-fit:cover;
                border-radius:8px;

            `;


            const title =
                document.createElement("h3");


            title.innerText =
                product.name || "Unnamed Product";


            const price =
                document.createElement("h4");


            price.innerText =
                `₹${Number(product.price || 0).toFixed(2)}`;


            const deleteButton =
                document.createElement("button");


            deleteButton.innerText =
                "Delete";


            deleteButton.style.cssText = `

                background:#d32f2f;
                color:white;
                border:none;
                padding:10px 18px;
                border-radius:6px;
                cursor:pointer;

            `;


            deleteButton.onclick =
                () => deleteProduct(
                    item.id
                );


            card.appendChild(
                image
            );


            card.appendChild(
                title
            );


            card.appendChild(
                price
            );


            card.appendChild(
                deleteButton
            );


            productList.appendChild(
                card
            );

        });


    }
    catch (error) {

        console.error(
            "Load products error:",
            error
        );


        productList.innerHTML = `

            <p style="
                color:red;
                text-align:center;
                padding:20px;
            ">
                Error loading products:
                ${escapeHTML(error.message)}
            </p>

        `;

    }

}


// ==========================================
// DELETE PRODUCT
// ==========================================

window.deleteProduct =
    async function (id) {

        if (!id) {

            return;

        }


        const confirmDelete =
            confirm(
                "Are you sure you want to delete this product?"
            );


        if (!confirmDelete) {

            return;

        }


        try {

            await deleteDoc(
                doc(
                    db,
                    "products",
                    id
                )
            );


            alert(
                "Product deleted successfully."
            );


            await loadProducts();

        }
        catch (error) {

            console.error(
                "Delete product error:",
                error
            );


            alert(
                "Delete failed.\n\n" +
                error.message
            );

        }

    };


// ==========================================
// LOGOUT
// ==========================================

window.logout =
    async function () {

        try {

            await signOut(
                auth
            );


            window.location.href =
                "login.html";

        }
        catch (error) {

            console.error(
                "Logout error:",
                error
            );


            alert(
                "Logout failed: " +
                error.message
            );

        }

    };


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
