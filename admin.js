import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const ADMIN_UID =
    "6LssLKjKdpZFkIXbz9MfEZFqTGv1";


// ======================================
// AUTH CHECK
// ======================================

onAuthStateChanged(auth, async (user) => {

    console.log("Admin auth:", user);

    if (!user) {

        window.location.href = "login.html";

        return;
    }


    if (user.uid !== ADMIN_UID) {

        alert("You are not authorized as admin.");

        await signOut(auth);

        window.location.href = "login.html";

        return;
    }


    console.log("✅ Admin logged in");

    loadProducts();

});


// ======================================
// ADD PRODUCT
// ======================================

window.addProduct = async function () {

    const nameInput =
        document.getElementById("productName");

    const priceInput =
        document.getElementById("productPrice");

    const categoryInput =
        document.getElementById("productCategory");

    const imageInput =
        document.getElementById("productImage");


    const name =
        nameInput?.value.trim();

    const price =
        Number(priceInput?.value);

    const category =
        categoryInput?.value.trim();


    if (!name) {

        alert("Enter product name.");

        return;
    }


    if (!price || price <= 0) {

        alert("Enter valid product price.");

        return;
    }


    if (!category) {

        alert("Enter product category.");

        return;
    }


    const file =
        imageInput?.files?.[0];


    if (!file) {

        alert("Please select product image.");

        return;
    }


    if (!file.type.startsWith("image/")) {

        alert("Please select an image file.");

        return;
    }


    try {

        const button =
            document.querySelector(
                ".add-product-btn"
            );


        if (button) {

            button.disabled = true;

            button.innerText =
                "Uploading...";
        }


        /*
         IMPORTANT

         Firebase Storage is NOT used here.

         We convert the image to Base64
         and store it directly inside Firestore.
        */

        const imageBase64 =
            await fileToBase64(file);


        await addDoc(
            collection(db, "products"),
            {

                name: name,

                price: price,

                category: category,

                image: imageBase64,

                createdAt:
                    new Date()

            }
        );


        alert(
            "Product added successfully!"
        );


        if (nameInput)
            nameInput.value = "";

        if (priceInput)
            priceInput.value = "";

        if (categoryInput)
            categoryInput.value = "";

        if (imageInput)
            imageInput.value = "";


        loadProducts();


    } catch (error) {

        console.error(
            "ADD PRODUCT ERROR:",
            error
        );


        alert(
            "Failed to add product:\n\n" +
            error.message
        );

    } finally {

        const button =
            document.querySelector(
                ".add-product-btn"
            );


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

    const container =
        document.getElementById(
            "productsList"
        );


    console.log(
        "loadProducts() started"
    );


    if (!container) {

        console.error(
            "❌ productsList element not found"
        );

        return;
    }


    container.innerHTML = `
        <div
            style="
                text-align:center;
                padding:30px;
                color:#777;
            "
        >
            Loading products...
        </div>
    `;


    try {

        console.log(
            "Reading products collection..."
        );


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        console.log(
            "Products found:",
            snapshot.size
        );


        if (snapshot.empty) {

            container.innerHTML = `
                <div
                    style="
                        text-align:center;
                        padding:30px;
                        color:#777;
                    "
                >
                    No products found.
                </div>
            `;

            return;
        }


        container.innerHTML = "";


        snapshot.forEach(
            (productDoc) => {

                const product =
                    productDoc.data();


                const productId =
                    productDoc.id;


                const card =
                    document.createElement(
                        "div"
                    );


                card.style.cssText = `
                    background:#fff;
                    border-radius:10px;
                    padding:18px;
                    margin-bottom:15px;
                    box-shadow:0 3px 12px rgba(0,0,0,.08);
                `;


                const image =
                    product.image || "";


                card.innerHTML = `

                    <div
                        style="
                            display:flex;
                            gap:20px;
                            align-items:center;
                            flex-wrap:wrap;
                        "
                    >

                        ${
                            image
                            ?
                            `
                            <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(
                                    product.name || "Product"
                                )}"
                                style="
                                    width:120px;
                                    height:120px;
                                    object-fit:cover;
                                    border-radius:8px;
                                    border:1px solid #ddd;
                                "
                                onerror="
                                    this.style.display='none';
                                "
                            >
                            `
                            :
                            `
                            <div
                                style="
                                    width:120px;
                                    height:120px;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    background:#eee;
                                    border-radius:8px;
                                    color:#777;
                                "
                            >
                                No Image
                            </div>
                            `
                        }


                        <div
                            style="
                                flex:1;
                                min-width:200px;
                            "
                        >

                            <h3
                                style="
                                    margin:0 0 8px;
                                "
                            >
                                ${escapeHTML(
                                    product.name || "-"
                                )}
                            </h3>


                            <p>
                                <strong>
                                    Price:
                                </strong>

                                ₹${Number(
                                    product.price || 0
                                ).toFixed(2)}
                            </p>


                            <p>
                                <strong>
                                    Category:
                                </strong>

                                ${escapeHTML(
                                    product.category || "-"
                                )}
                            </p>

                        </div>


                        <div>

                            <button
                                type="button"
                                onclick="editProduct('${productId}')"
                                style="
                                    background:#007bff;
                                    color:white;
                                    border:none;
                                    padding:9px 14px;
                                    border-radius:6px;
                                    cursor:pointer;
                                    margin-right:6px;
                                "
                            >
                                Edit
                            </button>


                            <button
                                type="button"
                                onclick="deleteProduct('${productId}')"
                                style="
                                    background:#dc3545;
                                    color:white;
                                    border:none;
                                    padding:9px 14px;
                                    border-radius:6px;
                                    cursor:pointer;
                                "
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "❌ LOAD PRODUCTS ERROR:",
            error
        );


        container.innerHTML = `

            <div
                style="
                    color:red;
                    text-align:center;
                    padding:30px;
                "
            >

                <strong>
                    ❌ Unable to load products
                </strong>

                <br><br>

                ${escapeHTML(
                    error.message
                )}

                <br><br>

                <button
                    onclick="loadProducts()"
                    style="
                        background:#111;
                        color:white;
                        border:none;
                        padding:10px 18px;
                        border-radius:6px;
                        cursor:pointer;
                    "
                >
                    Retry
                </button>

            </div>

        `;

    }

}


// ======================================
// DELETE PRODUCT
// ======================================

window.deleteProduct =
    async function(productId) {

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
                    productId
                )
            );


            alert(
                "Product deleted successfully."
            );


            loadProducts();


        } catch (error) {

            console.error(
                "Delete product error:",
                error
            );


            alert(
                "Delete failed:\n\n" +
                error.message
            );

        }

    };


// ======================================
// EDIT PRODUCT
// ======================================

window.editProduct =
    async function(productId) {

        const newName =
            prompt(
                "Enter new product name:"
            );


        if (newName === null) {

            return;
        }


        const newPrice =
            prompt(
                "Enter new product price:"
            );


        if (newPrice === null) {

            return;
        }


        const newCategory =
            prompt(
                "Enter new category:"
            );


        if (newCategory === null) {

            return;
        }


        const price =
            Number(newPrice);


        if (
            !newName.trim() ||
            !price ||
            price <= 0 ||
            !newCategory.trim()
        ) {

            alert(
                "Invalid product details."
            );

            return;
        }


        try {

            await updateDoc(
                doc(
                    db,
                    "products",
                    productId
                ),
                {

                    name:
                        newName.trim(),

                    price:
                        price,

                    category:
                        newCategory.trim()

                }
            );


            alert(
                "Product updated successfully."
            );


            loadProducts();


        } catch (error) {

            console.error(
                "Edit product error:",
                error
            );


            alert(
                "Update failed:\n\n" +
                error.message
            );

        }

    };


// ======================================
// LOGOUT
// ======================================

window.logoutAdmin =
    async function() {

        try {

            await signOut(auth);

            window.location.href =
                "login.html";

        } catch (error) {

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


// ======================================
// FILE → BASE64
// ======================================

function fileToBase64(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                () => resolve(
                    reader.result
                );


            reader.onerror =
                () => reject(
                    new Error(
                        "Failed to read image."
                    )
                );


            reader.readAsDataURL(
                file
            );

        }
    );

}


// ======================================
// ESCAPE HTML
// ======================================

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
