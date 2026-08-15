import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ==========================================
// LOAD REVIEWS
// ==========================================

async function loadCustomerReviews() {

    const reviewsContainer =
        document.getElementById("customerReviews");

    const averageRating =
        document.getElementById("averageRating");

    const averageStars =
        document.getElementById("averageStars");

    const reviewCount =
        document.getElementById("reviewCount");


    if (!reviewsContainer) {
        console.error("customerReviews not found");
        return;
    }


    reviewsContainer.innerHTML = `
        <div class="loading">
            Loading customer reviews...
        </div>
    `;


    try {

        const reviewsRef =
            collection(db, "reviews");


        const snapshot =
            await getDocs(reviewsRef);


        console.log(
            "Reviews found:",
            snapshot.size
        );


        // ==========================================
        // NO REVIEWS
        // ==========================================

        if (snapshot.empty) {

            reviewsContainer.innerHTML = `
                <div class="loading">
                    <h3>No reviews yet</h3>
                    <p>
                        Be the first customer to share
                        your experience!
                    </p>
                </div>
            `;


            if (averageRating) {
                averageRating.innerText = "0.0";
            }


            if (averageStars) {
                averageStars.innerText = "☆☆☆☆☆";
            }


            if (reviewCount) {
                reviewCount.innerText = "0 reviews";
            }


            return;
        }


        // ==========================================
        // REVIEW DATA
        // ==========================================

        let totalRating = 0;

        let validReviews = 0;


        reviewsContainer.innerHTML = "";


        snapshot.forEach((reviewDoc) => {

            const review =
                reviewDoc.data();


            const customerName =
                review.customerName ||
                "Customer";


            const productName =
                review.productName ||
                "MP Frames Product";


            const rating =
                Number(review.rating) || 0;


            const comment =
                review.comment ||
                "Great product!";


            totalRating += rating;

            validReviews++;


            // ======================================
            // CARD
            // ======================================

            const card =
                document.createElement("div");


            card.className =
                "review-card";


            // ======================================
            // HEADER
            // ======================================

            const header =
                document.createElement("div");


            header.className =
                "review-card-header";


            // ======================================
            // CUSTOMER NAME
            // ======================================

            const name =
                document.createElement("div");


            name.className =
                "customer-name";


            name.innerText =
                customerName;


            // ======================================
            // STARS
            // ======================================

            const stars =
                document.createElement("div");


            stars.className =
                "review-stars";


            stars.innerText =
                createStars(rating);


            // ======================================
            // PRODUCT
            // ======================================

            const product =
                document.createElement("div");


            product.className =
                "product-name";


            product.innerText =
                `Purchased: ${productName}`;


            // ======================================
            // COMMENT
            // ======================================

            const commentElement =
                document.createElement("div");


            commentElement.className =
                "review-comment";


            commentElement.innerText =
                `"${comment}"`;


            // ======================================
            // DATE
            // ======================================

            const date =
                document.createElement("div");


            date.className =
                "review-date";


            date.innerText =
                formatReviewDate(
                    review.createdAt
                );


            // ======================================
            // APPEND
            // ======================================

            header.appendChild(name);

            header.appendChild(stars);


            card.appendChild(header);

            card.appendChild(product);

            card.appendChild(commentElement);

            card.appendChild(date);


            reviewsContainer.appendChild(card);

        });


        // ==========================================
        // AVERAGE RATING
        // ==========================================

        const average =
            validReviews > 0
                ? totalRating / validReviews
                : 0;


        if (averageRating) {

            averageRating.innerText =
                average.toFixed(1);

        }


        if (averageStars) {

            averageStars.innerText =
                createStars(
                    Math.round(average)
                );

        }


        if (reviewCount) {

            reviewCount.innerText =
                `${validReviews} ${
                    validReviews === 1
                        ? "review"
                        : "reviews"
                }`;

        }

    }
    catch (error) {

        console.error(
            "❌ Error loading reviews:",
            error
        );


        reviewsContainer.innerHTML = `
            <div
                class="loading"
                style="color:red;"
            >
                <h3>
                    Unable to load reviews
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
// FORMAT DATE
// ==========================================

function formatReviewDate(timestamp) {

    if (!timestamp) {

        return "";

    }


    try {

        let date;


        // Firebase Timestamp

        if (
            timestamp &&
            typeof timestamp.toDate ===
                "function"
        ) {

            date =
                timestamp.toDate();

        }

        // JavaScript Date

        else if (
            timestamp instanceof Date
        ) {

            date =
                timestamp;

        }

        // String / number

        else {

            date =
                new Date(timestamp);

        }


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    }
    catch (error) {

        console.error(
            "Date formatting error:",
            error
        );


        return "";

    }

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

loadCustomerReviews();