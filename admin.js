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


// =====================================================
// AUTH
// =====================================================

const auth = getAuth(app);


// =====================================================
// ADMIN UID
// =====================================================

const ADMIN_UID = "6LssLKjKdpZFkIXbz9MfEZFqTGv1";


// =====================================================
// CLOUDINARY
// =====================================================

const CLOUDINARY_CLOUD_NAME = "dqavm3wk";

const CLOUDINARY_UPLOAD_PRESET = "mpframes";


// =====================================================
// AUTH CHECK
// =====================================================

onAuthStateChanged(auth, async (user) => {

    console.log("Auth state:", user);

    if (!user) {

        window.location.href = "login.html";

        return;
    }


    console.log("Logged in UID:", user.uid);


    if (user.uid !== ADMIN_UID) {

        alert("This account is not authorized as admin.");

        await signOut(auth);

        window.location.href = "login.html";

        return;
    }


    console.log("✅ Admin verified");


    await loadProducts();

});


// =====================================================
// CLOUDINARY UPLOAD
// =====================================================

async function uploadToCloudinary(file) {

    if (!CLOUDINARY_CLOUD_NAME) {

        throw new Error(
            "Cloudinary Cloud Name is not configured."
        );

    }


    if (!CLOUDINARY_UPLOAD_PRESET) {

        throw new Error(
            "Cloudinary Upload Preset is not configured."
        );

    }


    const url =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


    const formData = new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    console.log(
        "Uploading image to Cloudinary..."
    );


    const response =
        await fetch(
            url,
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
            "Cloudinary upload failed."
        );

    }


    if (!data.secure_url) {

        throw new Error(
            "Cloudinary image URL not received."
        );

    }


    return data.secure_url;

}


// =====================================================
// ADD PRODUCT
// =====================================================

window.addProduct = async function () {

    const nameInput =
        document.getElementById("name");

    const priceInput =
        document.getElementById("price");

    const categoryInput =
        document.getElementById("category");

    const imageInput =
        document.getElementById("image");


    const name =
        nameInput?.value.trim() || "";


    const price =
        priceInput?.value.trim() || "";


    const category =
        categoryInput?.value.trim() || "";


    const imageFile =
        imageInput?.files?.[0];


    // =================================================
    // VALIDATION
    // =================================================

    if (!name) {

        alert("Please enter product name.");

        nameInput?.focus();

        return;
    }


    if (!price) {

        alert("Please enter product price.");

        priceInput?.focus();

        return;
    }


    if (
        isNaN(Number(price)) ||
        Number(price) <= 0
    ) {

        alert("Please enter a valid price.");

        return;
    }


    if (!imageFile) {

        alert("Please select a product image.");

        return;
    }


    if (
        !imageFile.type.startsWith("image/")
    ) {

        alert("Please select a valid image.");

        return;
    }


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
            ".add-product-btn"
        ) ||
        document.querySelector(
            'button[onclick="addProduct()"]'
        );


    try {

        if (button) {

            button.disabled = true;

            button.innerText =
                "Uploading Image...";

        }


        // =================================================
        // CLOUDINARY
        // =================================================

        const imageURL =
            await uploadToCloudinary(
                imageFile
            );


        console.log(
            "Cloudinary URL:",
            imageURL
        );


        if (button) {

            button.innerText =
                "Saving Product...";

        }


        // =================================================
        // FIRESTORE
        // =================================================

        const productData = {

            name: name,

            price: Number(price),

            category: category,

            image: imageURL,

            createdAt: new Date()

        };


        const docRef =
            await addDoc(
                collection(
                    db,
                    "products"
                ),
                productData
            );


        console.log(
            "✅ Product saved:",
            docRef.id
        );


        // =================================================
        // CLEAR FORM
        // =================================================

        if (nameInput) {
            nameInput.value = "";
        }

        if (priceInput) {
            priceInput.value = "";
        }

        if (categoryInput) {
            categoryInput.value = "";
        }

        if (imageInput) {
            imageInput.value = "";
        }


        alert(
            "Product added successfully! ✅"
        );


        // =================================================
        // RELOAD
        // =================================================

        await loadProducts();

    }
    catch (error) {

        console.error(
            "❌ ADD PRODUCT ERROR:",
            error
        );


        alert(
            "Product upload failed:\n\n" +
            error.message
        );

    }
    finally {

        if (button) {

            button.disabled = false;

            button.innerText =
                "Add Product";

        }

    }

};


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {

    // IMPORTANT:
    // Your HTML uses products-List

    const list =
        document.getElementById(
            "products-List"
        );


    if (!list) {

        console.error(
            "❌ products-List not found in HTML"
        );

        return;
    }


    list.innerHTML = `

        <div style="
            text-align:center;
            padding:30px;
        ">

            Loading Products...

        </div>

    `;


    try {

        console.log(
            "================================="
        );

        console.log(
            "Loading products..."
        );

        console.log(
            "Firebase DB:",
            db
        );


        // =================================================
        // GET PRODUCTS
        // =================================================

        const productsRef =
            collection(
                db,
                "products"
            );


        const snapshot =
            await getDocs(
                productsRef
            );


        console.log(
            "🔥 Products found:",
            snapshot.size
        );


        // =================================================
        // EMPTY
        // =================================================

        if (snapshot.empty) {

            list.innerHTML = `

                <div style="
                    text-align:center;
                    padding:30px;
                    color:#777;
                ">

                    <h3>
                        No Products Found
                    </h3>

                    <p>
                        Firestore products collection is empty.
                    </p>

                </div>

            `;

            return;
        }


        // =================================================
        // CLEAR
        // =================================================

        list.innerHTML = "";


        // =================================================
        // DISPLAY PRODUCTS
        // =================================================

        snapshot.forEach(
            (productDoc) => {

                const product =
                    productDoc.data();


                console.log(
                    "PRODUCT:",
                    productDoc.id,
                    product
                );


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "admin-product-card";


                card.style.cssText = `

                    background:#fff;

                    border-radius:12px;

                    padding:15px;

                    margin:10px;

                    box-shadow:
                        0 4px 15px
                        rgba(0,0,0,.10);

                    text-align:center;

                `;


                // =================================================
                // IMAGE
                // =================================================

                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    product.image || "";


                image.alt =
                    product.name ||
                    "Product";


                image.style.cssText = `

                    width:180px;

                    height:180px;

                    object-fit:cover;

                    border-radius:10px;

                    display:block;

                    margin:0 auto 15px;

                `;


                image.onerror =
                    function () {

                        this.alt =
                            "Image unavailable";

                    };


                // =================================================
                // NAME
                // =================================================

                const title =
                    document.createElement(
                        "h3"
                    );


                title.innerText =
                    product.name ||
                    "Unnamed Product";


                // =================================================
                // PRICE
                // =================================================

                const price =
                    document.createElement(
                        "p"
                    );


                price.innerText =
                    `₹${Number(
                        product.price || 0
                    ).toFixed(2)}`;


                price.style.cssText = `

                    font-size:18px;

                    font-weight:bold;

                    margin:8px;

                `;


                // =================================================
                // CATEGORY
                // =================================================

                const category =
                    document.createElement(
                        "p"
                    );


                category.innerText =
                    product.category ||
                    "No Category";


                category.style.cssText = `

                    color:#666;

                    margin:5px;

                `;


                // =================================================
                // DELETE BUTTON
                // =================================================

                const deleteButton =
                    document.createElement(
                        "button"
                    );


                deleteButton.innerText =
                    "Delete";


                deleteButton.style.cssText = `

                    background:#d32f2f;

                    color:white;

                    border:none;

                    border-radius:6px;

                    padding:10px 20px;

                    cursor:pointer;

                    font-weight:bold;

                    margin-top:10px;

                `;


                deleteButton.onclick =
                    async function () {

                        await deleteProduct(
                            productDoc.id
                        );

                    };


                // =================================================
                // APPEND
                // =================================================

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
                    category
                );


                card.appendChild(
                    deleteButton
                );


                list.appendChild(
                    card
                );

            }
        );


        console.log(
            "✅ All products displayed"
        );

    }
    catch (error) {

        console.error(
            "❌ LOAD PRODUCTS ERROR:",
            error
        );


        list.innerHTML = `

            <div style="
                color:red;
                text-align:center;
                padding:30px;
            ">

                <h3>
                    ❌ Error Loading Products
                </h3>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>

        `;

    }

}


// =====================================================
// DELETE PRODUCT
// =====================================================

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
                "Product deleted successfully! ✅"
            );


            await loadProducts();

        }
        catch (error) {

            console.error(
                "Delete error:",
                error
            );


            alert(
                "Delete failed:\n\n" +
                error.message
            );

        }

    };


// =====================================================
// LOGOUT
// =====================================================

window.logoutAdmin =
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
                "Logout failed:\n\n" +
                error.message
            );

        }

    };


window.logout =
    window.logoutAdmin;


// =====================================================
// ESCAPE HTML
// =====================================================

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
