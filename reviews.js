import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ==========================================
// ADD REVIEW
// ==========================================

window.addReview = async function () {

    const customerName =
        document
            .getElementById("reviewCustomerName")
            ?.value
            .trim() || "";

    const productName =
        document
            .getElementById("reviewProductName")
            ?.value
            .trim() || "";

    const rating =
        document
            .getElementById("reviewRating")
            ?.value || "";

    const comment =
        document
            .getElementById("reviewComment")
            ?.value
            .trim() || "";


    // ======================================
    // VALIDATION
    // ======================================

    if (!customerName) {

        alert("Please enter customer name.");

        document
            .getElementById("reviewCustomerName")
            ?.focus();

        return;
    }


    if (!productName) {

        alert("Please enter product name.");

        document
            .getElementById("reviewProductName")
            ?.focus();

        return;
    }


    if (!rating) {

        alert("Please select rating.");

        return;
    }


    if (!comment) {

        alert("Please enter review comment.");

        document
            .getElementById("reviewComment")
            ?.focus();

        return;
    }


    const ratingNumber =
        Number(rating);


    if (
        ratingNumber < 1 ||
        ratingNumber > 5
    ) {

        alert("Rating must be between 1 and 5.");

        return;
    }


    // ======================================
    // BUTTON
    // ======================================

    const button =
        document.querySelector(
            'button[onclick="addReview()"]'
        );


    try {

        if (button) {

            button.disabled = true;

            button.innerText =
                "Saving Review...";
        }


        // ======================================
        // FIREBASE
        // ======================================

        const reviewData = {

            customerName:
                customerName,

            productName:
                productName,

            rating:
                ratingNumber,

            comment:
                comment,

            createdAt:
                serverTimestamp()

        };


        const reviewRef =
            await addDoc(
                collection(
                    db,
                    "reviews"
                ),
                reviewData
            );


        console.log(
            "✅ Review saved:",
            reviewRef.id
        );


        // ======================================
        // CLEAR FORM
        // ======================================

        document
            .getElementById(
                "reviewCustomerName"
            )
            .value = "";


        document
            .getElementById(
                "reviewProductName"
            )
            .value = "";


        document
            .getElementById(
                "reviewRating"
            )
            .value = "";


        document
            .getElementById(
                "reviewComment"
            )
            .value = "";


        alert(
            "Customer review added successfully! ⭐"
        );


        // ======================================
        // RELOAD REVIEWS
        // ======================================

        await loadAdminReviews();

    }
    catch (error) {

        console.error(
            "❌ ADD REVIEW ERROR:",
            error
        );


        alert(
            "Failed to add review:\n\n" +
            error.message
        );

    }
    finally {

        if (button) {

            button.disabled = false;

            button.innerText =
                "⭐ Add Review";
        }

    }

};


// ==========================================
// LOAD REVIEWS
// ==========================================

async function loadAdminReviews() {

    const reviewsList =
        document.getElementById(
            "reviewsList"
        );


    if (!reviewsList) {

        console.error(
            "reviewsList not found."
        );

        return;
    }


    reviewsList.innerHTML = `
        <div
            style="
                background:white;
                padding:30px;
                text-align:center;
                border-radius:10px;
            "
        >
            Loading Reviews...
        </div>
    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "reviews"
                )
            );


        console.log(
            "🔥 Reviews found:",
            snapshot.size
        );


        // ======================================
        // NO REVIEWS
        // ======================================

        if (snapshot.empty) {

            reviewsList.innerHTML = `
                <div
                    style="
                        background:white;
                        padding:30px;
                        text-align:center;
                        border-radius:10px;
                        color:#777;
                    "
                >
                    <h3>
                        No Reviews Found
                    </h3>

                    <p>
                        Add your first review above.
                    </p>
                </div>
            `;

            return;
        }


        reviewsList.innerHTML = "";


        // ======================================
        // DISPLAY
        // ======================================

        snapshot.forEach(
            (reviewDoc) => {

                const review =
                    reviewDoc.data();


                const customerName =
                    review.customerName ||
                    "Customer";


                const productName =
                    review.productName ||
                    "Product";


                const rating =
                    Number(
                        review.rating
                    ) || 0;


                const comment =
                    review.comment ||
                    "";


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "review-card";


                // ==================================
                // NAME
                // ==================================

                const name =
                    document.createElement(
                        "h3"
                    );


                name.innerText =
                    customerName;


                // ==================================
                // PRODUCT
                // ==================================

                const product =
                    document.createElement(
                        "div"
                    );


                product.className =
                    "review-product";


                product.innerText =
                    `Product: ${productName}`;


                // ==================================
                // STARS
                // ==================================

                const stars =
                    document.createElement(
                        "div"
                    );


                stars.className =
                    "review-stars";


                stars.innerText =
                    createStars(
                        rating
                    );


                // ==================================
                // COMMENT
                // ==================================

                const commentElement =
                    document.createElement(
                        "div"
                    );


                commentElement.className =
                    "review-comment";


                commentElement.innerText =
                    `"${comment}"`;


                // ==================================
                // DELETE
                // ==================================

                const deleteButton =
                    document.createElement(
                        "button"
                    );


                deleteButton.className =
                    "delete-review-btn";


                deleteButton.innerText =
                    "Delete";


                deleteButton.onclick =
                    async function () {

                        await deleteReview(
                            reviewDoc.id
                        );

                    };


                // ==================================
                // APPEND
                // ==================================

                card.appendChild(
                    name
                );

                card.appendChild(
                    product
                );

                card.appendChild(
                    stars
                );

                card.appendChild(
                    commentElement
                );

                card.appendChild(
                    deleteButton
                );


                reviewsList.appendChild(
                    card
                );

            }
        );

    }
    catch (error) {

        console.error(
            "❌ LOAD REVIEWS ERROR:",
            error
        );


        reviewsList.innerHTML = `
            <div
                style="
                    background:white;
                    color:red;
                    padding:30px;
                    text-align:center;
                    border-radius:10px;
                "
            >
                Error loading reviews:

                <br><br>

                ${escapeHTML(
                    error.message
                )}
            </div>
        `;

    }

}


// ==========================================
// DELETE REVIEW
// ==========================================

window.deleteReview =
    async function (id) {

        if (!id) {
            return;
        }


        const confirmed =
            confirm(
                "Are you sure you want to delete this review?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await deleteDoc(
                doc(
                    db,
                    "reviews",
                    id
                )
            );


            alert(
                "Review deleted successfully! ✅"
            );


            await loadAdminReviews();

        }
        catch (error) {

            console.error(
                "❌ DELETE REVIEW ERROR:",
                error
            );


            alert(
                "Delete failed:\n\n" +
                error.message
            );

        }

    };


// ==========================================
// CREATE STARS
// ==========================================

function createStars(rating) {

    rating =
        Math.max(
            0,
            Math.min(
                5,
                Number(rating) || 0
            )
        );


    let stars = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        stars +=
            i <= rating
                ? "★"
                : "☆";

    }


    return stars;

}


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


// ==========================================
// START
// ==========================================

loadAdminReviews();
