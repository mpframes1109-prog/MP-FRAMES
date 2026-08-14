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

                    if (
                        typeof order.createdAt.toDate ===
                        "function"
                    ) {

                        dateText =
                            order.createdAt
                                .toDate()
                                .toLocaleString();

                    } else {

                        dateText =
                            new Date(
                                order.createdAt
                            ).toLocaleString();

                    }

                } catch (error) {

                    dateText = "-";

                }

            }


            // ==================================
            // PHOTO
            // ==================================

            let imageHTML = `
                <span style="color:#888;">
                    No Image
                </span>
            `;


            if (order.photo) {

                const photoURL =
                    escapeHTML(order.photo);


                imageHTML = `
                    <div class="photo-actions">

                        <img
                            src="${photoURL}"
                            alt="Customer Photo"
                            class="order-photo"
                            style="
                                width:100px;
                                height:100px;
                                object-fit:cover;
                                border-radius:8px;
                                display:block;
                                margin:auto;
                            "
                            onerror="
                                this.style.display='none';
                                this.nextElementSibling.style.display='block';
                            "
                        >

                        <span
                            style="
                                display:none;
                                color:red;
                                font-size:12px;
                            "
                        >
                            Image failed
                        </span>

                        <div style="margin-top:8px;">

                            <a
                                href="${photoURL}"
                                target="_blank"
                                rel="noopener"
                                style="
                                    display:inline-block;
                                    margin:2px;
                                    padding:6px 10px;
                                    background:#111;
                                    color:white;
                                    text-decoration:none;
                                    border-radius:5px;
                                    font-size:12px;
                                "
                            >
                                👁 View
                            </a>

                            <a
                                href="${photoURL}"
                                target="_blank"
                                rel="noopener"
                                download
                                style="
                                    display:inline-block;
                                    margin:2px;
                                    padding:6px 10px;
                                    background:#198754;
                                    color:white;
                                    text-decoration:none;
                                    border-radius:5px;
                                    font-size:12px;
                                "
                            >
                                ⬇ Download
                            </a>

                        </div>

                    </div>
                `;

            }


            // ==================================
            // PAYMENT
            // ==================================

            const paymentStatus =
                order.paymentStatus ||
                "Not Paid";


            // ==================================
            // STATUS
            // ==================================

            const orderStatus =
                order.status ||
                "Pending";


            // ==================================
            // ROW
            // ==================================

            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        order.customerName || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        order.phone || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        order.address || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        order.frameName || "-"
                    )}
                </td>

                <td>
                    ${Number(
                        order.quantity || 1
                    )}
                </td>

                <td>
                    ₹${Number(
                        order.price || 0
                    ).toFixed(2)}
                </td>

                <td>
                    ${imageHTML}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(
                            paymentStatus
                        )}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(
                        orderStatus
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        order.message || "-"
                    )}
                </td>

                <td>
                    ₹${Number(
                        order.orderTotal || 0
                    ).toFixed(2)}
                </td>

                <td>
                    ${escapeHTML(
                        dateText
                    )}
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

                    ${escapeHTML(
                        error.message
                    )}

                </td>
            </tr>
        `;

    }

}


// ======================================
// AUTH CHECK
// ======================================

onAuthStateChanged(
    auth,
    async (user) => {

        console.log(
            "Auth state changed:",
            user
        );


        // ==================================
        // NOT LOGGED IN
        // ==================================

        if (!user) {

            console.log(
                "No user logged in."
            );

            const tbody =
                document.getElementById(
                    "ordersBody"
                );

            if (tbody) {

                tbody.innerHTML = `
                    <tr>
                        <td
                            colspan="13"
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


        // ==================================
        // USER UID
        // ==================================

        console.log(
            "Logged in UID:",
            user.uid
        );


        // ==================================
        // ADMIN CHECK
        // ==================================

        if (user.uid !== ADMIN_UID) {

            console.error(
                "Wrong admin account:",
                user.uid
            );


            const tbody =
                document.getElementById(
                    "ordersBody"
                );


            if (tbody) {

                tbody.innerHTML = `
                    <tr>
                        <td
                            colspan="13"
                            style="
                                color:red;
                                text-align:center;
                                padding:25px;
                            "
                        >

                            ❌ This account is
                            not the admin account.

                            <br><br>

                            UID:
                            ${escapeHTML(user.uid)}

                        </td>
                    </tr>
                `;

            }

            return;
        }


        console.log(
            "✅ Admin UID verified"
        );


        // ==================================
        // LOAD ORDERS
        // ==================================

        await loadOrders();

    }
);


// ======================================
// LOGOUT
// ======================================

window.logoutAdmin =
async function () {

    try {

        await signOut(auth);

        console.log(
            "Admin logged out"
        );

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
