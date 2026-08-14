import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ======================================
// ADMIN UID
// ======================================

const ADMIN_UID =
    "6LssLKjKdpZFkIXbz9MfEZFqTGv1";


// ======================================
// LOAD ORDERS
// ======================================

async function loadOrders() {

    const tbody =
        document.getElementById("ordersBody");

    if (!tbody) {

        console.error(
            "ordersBody not found"
        );

        return;
    }


    tbody.innerHTML = `
        <tr>
            <td
                colspan="13"
                class="loading"
                style="
                    text-align:center;
                    padding:25px;
                "
            >
                Loading Orders...
            </td>
        </tr>
    `;


    try {

        console.log(
            "Loading orders..."
        );

        console.log(
            "Current Firebase user:",
            auth.currentUser
        );


        // ==================================
        // FIRESTORE QUERY
        // ==================================

        const ordersQuery = query(
            collection(db, "orders"),
            orderBy(
                "createdAt",
                "desc"
            )
        );


        const snapshot =
            await getDocs(
                ordersQuery
            );


        console.log(
            "Orders found:",
            snapshot.size
        );


        // ==================================
        // NO ORDERS
        // ==================================

        if (snapshot.empty) {

            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="13"
                        style="
                            text-align:center;
                            padding:30px;
                            color:#777;
                        "
                    >
                        No orders found.
                    </td>
                </tr>
            `;

            return;
        }


        tbody.innerHTML = "";


        // ==================================
        // EACH ORDER
        // ==================================

        snapshot.forEach((orderDoc) => {

            const order =
                orderDoc.data();


            const orderId =
                orderDoc.id;


            const row =
                document.createElement("tr");


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
            // CUSTOMER PHOTO
            // ==================================

            let imageHTML = `
                <span
                    style="
                        color:#888;
                    "
                >
                    No Image
                </span>
            `;


            if (order.photo) {

                const photoURL =
                    escapeHTML(
                        order.photo
                    );


                imageHTML = `
                    <div
                        class="photo-actions"
                        style="
                            text-align:center;
                        "
                    >

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


                        <div
                            style="
                                margin-top:8px;
                            "
                        >

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
            // PAYMENT STATUS
            // ==================================

            const paymentStatus =
                order.paymentStatus ||
                "Not Paid";


            // ==================================
            // ORDER STATUS
            // ==================================

            const orderStatus =
                order.status ||
                "Pending";


            // ==================================
            // ROW
            // ==================================
            //
            // IMPORTANT:
            // Header order:
            //
            // 1 Name
            // 2 Phone
            // 3 Address
            // 4 Frame
            // 5 Frame Image
            // 6 Quantity
            // 7 Price
            // 8 Customer Photo
            // 9 Message
            // 10 Payment
            // 11 Status
            // 12 Update
            // 13 Date
            //
            // ==================================

            row.innerHTML = `

                <!-- NAME -->

                <td>
                    ${escapeHTML(
                        order.customerName || "-"
                    )}
                </td>


                <!-- PHONE -->

                <td>
                    ${escapeHTML(
                        order.phone || "-"
                    )}
                </td>


                <!-- ADDRESS -->

                <td>
                    ${escapeHTML(
                        order.address || "-"
                    )}
                </td>


                <!-- FRAME -->

                <td>
                    ${escapeHTML(
                        order.frameName || "-"
                    )}
                </td>


                <!-- FRAME IMAGE -->

                <td>
                    ${
                        order.frameImage
                        ? `
                            <img
                                src="${escapeHTML(
                                    order.frameImage
                                )}"
                                style="
                                    width:80px;
                                    height:80px;
                                    object-fit:cover;
                                    border-radius:6px;
                                "
                                alt="Frame"
                            >
                          `
                        : `
                            <span
                                style="
                                    color:#888;
                                "
                            >
                                No Image
                            </span>
                          `
                    }
                </td>


                <!-- QUANTITY -->

                <td>
                    ${Number(
                        order.quantity || 1
                    )}
                </td>


                <!-- PRICE -->

                <td>
                    ₹${Number(
                        order.price || 0
                    ).toFixed(2)}
                </td>


                <!-- CUSTOMER PHOTO -->

                <td>
                    ${imageHTML}
                </td>


                <!-- MESSAGE -->

                <td>
                    ${escapeHTML(
                        order.message || "-"
                    )}
                </td>


                <!-- PAYMENT -->

                <td>
                    <strong
                        style="
                            color:${
                                paymentStatus
                                .toLowerCase()
                                .includes("paid")
                                ? "green"
                                : "red"
                            };
                        "
                    >
                        ${escapeHTML(
                            paymentStatus
                        )}
                    </strong>
                </td>


                <!-- STATUS -->

                <td
                    id="status-${orderId}"
                >
                    ${escapeHTML(
                        orderStatus
                    )}
                </td>


                <!-- UPDATE -->

                <td>

                    <select
                        id="statusSelect-${orderId}"
                        style="
                            padding:6px;
                            border-radius:5px;
                            border:1px solid #ccc;
                            margin-bottom:5px;
                        "
                    >

                        <option
                            value="Pending"
                            ${
                                orderStatus ===
                                "Pending"
                                ? "selected"
                                : ""
                            }
                        >
                            Pending
                        </option>


                        <option
                            value="Processing"
                            ${
                                orderStatus ===
                                "Processing"
                                ? "selected"
                                : ""
                            }
                        >
                            Processing
                        </option>


                        <option
                            value="Shipped"
                            ${
                                orderStatus ===
                                "Shipped"
                                ? "selected"
                                : ""
                            }
                        >
                            Shipped
                        </option>


                        <option
                            value="Delivered"
                            ${
                                orderStatus ===
                                "Delivered"
                                ? "selected"
                                : ""
                            }
                        >
                            Delivered
                        </option>


                        <option
                            value="Cancelled"
                            ${
                                orderStatus ===
                                "Cancelled"
                                ? "selected"
                                : ""
                            }
                        >
                            Cancelled
                        </option>

                    </select>


                    <br>


                    <button
                        type="button"
                        onclick="updateOrderStatus('${orderId}')"
                        style="
                            background:#111;
                            color:white;
                            border:none;
                            padding:7px 12px;
                            border-radius:5px;
                            cursor:pointer;
                        "
                    >
                        Update
                    </button>

                </td>


                <!-- DATE -->

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
// UPDATE ORDER STATUS
// ======================================

window.updateOrderStatus =
    async function(orderId) {

        try {

            const select =
                document.getElementById(
                    `statusSelect-${orderId}`
                );


            if (!select) {

                alert(
                    "Status selector not found."
                );

                return;
            }


            const newStatus =
                select.value;


            // ==================================
            // UPDATE FIRESTORE
            // ==================================

            await updateDoc(
                doc(
                    db,
                    "orders",
                    orderId
                ),
                {
                    status: newStatus
                }
            );


            // ==================================
            // UPDATE DISPLAY
            // ==================================

            const statusCell =
                document.getElementById(
                    `status-${orderId}`
                );


            if (statusCell) {

                statusCell.innerText =
                    newStatus;

            }


            alert(
                "Order status updated successfully."
            );


            console.log(
                "Order updated:",
                orderId,
                newStatus
            );


        } catch (error) {

            console.error(
                "Status update error:",
                error
            );


            alert(
                "Failed to update order status:\n\n" +
                error.message
            );

        }

    };


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
        // CHECK UID
        // ==================================

        console.log(
            "Logged in UID:",
            user.uid
        );


        if (
            user.uid !==
            ADMIN_UID
        ) {

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
                            ${escapeHTML(
                                user.uid
                            )}

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
    async function() {

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
