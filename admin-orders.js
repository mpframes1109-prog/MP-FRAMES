import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const ADMIN_UID = "6LssLKjKdpZFkIXbz9MfEZFqTGv1";


// ======================================
// LOAD ORDERS
// ======================================

async function loadOrders() {

    const tbody = document.getElementById("ordersBody");

    if (!tbody) {
        console.error("ordersBody not found");
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="13" class="loading">
                Loading Orders...
            </td>
        </tr>
    `;

    try {

        console.log("Loading orders...");
        console.log("Current Firebase user:", auth.currentUser);

        const ordersQuery = query(
            collection(db, "orders"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(ordersQuery);

        console.log("Orders found:", snapshot.size);

        if (snapshot.empty) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="13" class="loading">
                        No orders found.
                    </td>
                </tr>
            `;

            return;
        }


        tbody.innerHTML = "";


        snapshot.forEach((doc) => {

            const order = doc.data();

            const row = document.createElement("tr");


            // ==================================
            // DATE
            // ==================================

            let dateText = "-";

            if (order.createdAt) {

                try {

                    if (typeof order.createdAt.toDate === "function") {

                        dateText =
                            order.createdAt
                                .toDate()
                                .toLocaleString();

                    } else {

                        dateText =
                            new Date(order.createdAt)
                                .toLocaleString();

                    }

                } catch (e) {

                    dateText = "-";

                }

            }


            // ==================================
            // IMAGE
            // ==================================

            let imageHTML = "No Image";

            if (order.photo) {

                imageHTML = `
                    <div class="photo-actions">

                        <img
                            src="${escapeHTML(order.photo)}"
                            alt="Customer Photo"
                            class="order-photo"
                        >

                        <br>

                        <a
                            href="${escapeHTML(order.photo)}"
                            target="_blank"
                            class="view-btn"
                        >
                            👁 View
                        </a>

                        <a
                            href="${escapeHTML(order.photo)}"
                            target="_blank"
                            download
                            class="download-btn"
                        >
                            ⬇ Download
                        </a>

                    </div>
                `;

            }


            // ==================================
            // PAYMENT
            // ==================================

            const paymentStatus =
                order.paymentStatus ||
                order.status ||
                "Not Paid";


            // ==================================
            // ROW
            // ==================================

            row.innerHTML = `

                <td>
                    ${escapeHTML(order.customerName || "-")}
                </td>

                <td>
                    ${escapeHTML(order.phone || "-")}
                </td>

                <td>
                    ${escapeHTML(order.address || "-")}
                </td>

                <td>
                    ${escapeHTML(order.frameName || "-")}
                </td>

                <td>
                    ${imageHTML}
                </td>

                <td>
                    ${order.quantity || 1}
                </td>

                <td>
                    ₹${Number(order.price || 0).toFixed(2)}
                </td>

                <td>
                    ${escapeHTML(paymentStatus)}
                </td>

                <td>
                    ${escapeHTML(order.status || "Pending")}
                </td>

                <td>
                    ${escapeHTML(order.message || "-")}
                </td>

                <td>
                    ₹${Number(order.orderTotal || 0).toFixed(2)}
                </td>

                <td>
                    ${escapeHTML(order.category || "-")}
                </td>

                <td>
                    ${escapeHTML(dateText)}
                </td>

            `;


            tbody.appendChild(row);

        });


    } catch (error) {

        console.error(
            "FIRESTORE ORDER ERROR:",
            error
        );


        tbody.innerHTML = `

            <tr>

                <td
                    colspan="13"
                    style="
                        color:red;
                        padding:25px;
                        text-align:center;
                    "
                >

                    ❌ Error loading orders

                    <br><br>

                    ${escapeHTML(error.message)}

                </td>

            </tr>

        `;

    }

}


// ======================================
// AUTH CHECK
// ======================================

onAuthStateChanged(auth, async (user) => {

    console.log("Auth state changed:", user);


    if (!user) {

        console.log("No user logged in.");

        const tbody =
            document.getElementById("ordersBody");

        if (tbody) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="13"
                        style="
                            color:red;
                            text-align:center;
                            padding:25px;
                        "
                    >
                        ❌ Admin login required.
                    </td>
                </tr>
            `;

        }

        return;
    }


    console.log("Logged in UID:", user.uid);


    // ==================================
    // CHECK ADMIN UID
    // ==================================

    if (user.uid !== ADMIN_UID) {

        console.error(
            "Wrong admin account.",
            user.uid
        );

        const tbody =
            document.getElementById("ordersBody");

        if (tbody) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="13"
                        style="
                            color:red;
                            text-align:center;
                            padding:25px;
                        "
                    >
                        ❌ This account is not the admin account.
                    </td>
                </tr>
            `;

        }

        return;
    }


    console.log("✅ Admin UID verified");


    // ==================================
    // LOAD ORDERS
    // ==================================

    await loadOrders();

});


// ======================================
// LOGOUT
// ======================================

window.logoutAdmin = async function () {

    try {

        await signOut(auth);

        alert("Logged out successfully.");

        window.location.href = "login.html";

    } catch (error) {

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


// ======================================
// ESCAPE HTML
// ======================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
