import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const table = document.getElementById("ordersTable");


// ===============================
// LOAD ORDERS
// ===============================

async function loadOrders() {

    if (!table) return;

    table.innerHTML = `
        <tr>
            <td colspan="11">
                Loading orders...
            </td>
        </tr>
    `;


    try {

        const snapshot =
            await getDocs(
                collection(db, "orders")
            );


        table.innerHTML = "";


        if (snapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="11">
                        No orders found
                    </td>
                </tr>
            `;

            return;
        }


        snapshot.forEach((document) => {

            const order = document.data();

            const id = document.id;


            // ===============================
            // PHOTO
            // ===============================

            let photoHTML = "No Photo";


            if (order.photo) {

                photoHTML = `

                    <img
                        src="${order.photo}"
                        width="90"
                        height="90"
                        style="
                            object-fit:cover;
                            border-radius:8px;
                            display:block;
                            margin:auto;
                        "
                    >

                    <div style="
                        margin-top:8px;
                        display:flex;
                        gap:5px;
                        justify-content:center;
                        flex-direction:column;
                    ">

                        <a
                            href="${order.photo}"
                            target="_blank"
                            style="
                                background:#25D366;
                                color:white;
                                padding:8px;
                                text-decoration:none;
                                border-radius:5px;
                            "
                        >
                            🔍 View
                        </a>


                        <a
                            href="${order.photo}"
                            target="_blank"
                            download
                            style="
                                background:#2196F3;
                                color:white;
                                padding:8px;
                                text-decoration:none;
                                border-radius:5px;
                            "
                        >
                            ⬇️ Download
                        </a>

                    </div>

                `;

            }


            // ===============================
            // PAYMENT STATUS
            // ===============================

            const paymentStatus =
                order.paymentStatus || "Not Paid";


            let paymentColor = "#dc3545";


            if (
                paymentStatus === "Paid"
            ) {

                paymentColor = "#198754";

            }


            // ===============================
            // CREATED DATE
            // ===============================

            let createdDate = "";


            if (order.createdAt) {

                try {

                    if (
                        typeof order.createdAt.toDate ===
                        "function"
                    ) {

                        createdDate =
                            order.createdAt
                                .toDate()
                                .toLocaleString();

                    }
                    else {

                        createdDate =
                            new Date(
                                order.createdAt
                            ).toLocaleString();

                    }

                }
                catch {

                    createdDate = "";

                }

            }


            // ===============================
            // TABLE ROW
            // ===============================

            table.innerHTML += `

                <tr>

                    <!-- NAME -->

                    <td>
                        ${order.customerName || ""}
                    </td>


                    <!-- PHONE -->

                    <td>
                        ${order.phone || ""}
                    </td>


                    <!-- ADDRESS -->

                    <td>
                        ${order.address || ""}
                    </td>


                    <!-- FRAME -->

                    <td>
                        ${order.frameName || ""}
                    </td>


                    <!-- QUANTITY -->

                    <td>
                        ${order.quantity || 1}
                    </td>


                    <!-- PRICE -->

                    <td>
                        ₹${order.price || 0}
                    </td>


                    <!-- PHOTO -->

                    <td>
                        ${photoHTML}
                    </td>


                    <!-- PAYMENT -->

                    <td>

                        <b style="
                            color:${paymentColor};
                        ">
                            ${paymentStatus}
                        </b>

                        ${
                            order.paymentId
                            ? `
                                <br>

                                <small>
                                    ID:
                                    ${order.paymentId}
                                </small>
                              `
                            : ""
                        }

                    </td>


                    <!-- ORDER STATUS -->

                    <td>

                        <select
                            id="status-${id}"
                        >

                            <option
                                value="Pending"
                                ${
                                    order.status ===
                                    "Pending"
                                    ? "selected"
                                    : ""
                                }
                            >
                                Pending
                            </option>


                            <option
                                value="Confirmed"
                                ${
                                    order.status ===
                                    "Confirmed"
                                    ? "selected"
                                    : ""
                                }
                            >
                                Confirmed
                            </option>


                            <option
                                value="Delivered"
                                ${
                                    order.status ===
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
                                    order.status ===
                                    "Cancelled"
                                    ? "selected"
                                    : ""
                                }
                            >
                                Cancelled
                            </option>

                        </select>

                    </td>


                    <!-- UPDATE -->

                    <td>

                        <button
                            onclick="
                                updateStatus('${id}')
                            "
                        >
                            Update
                        </button>

                    </td>


                    <!-- DATE -->

                    <td>
                        ${createdDate}
                    </td>

                </tr>

            `;

        });

    }
    catch (error) {

        console.error(
            "Load orders error:",
            error
        );


        table.innerHTML = `

            <tr>

                <td colspan="11">

                    ❌ Failed to load orders

                    <br><br>

                    ${error.message}

                </td>

            </tr>

        `;

    }

}



// ===============================
// UPDATE STATUS
// ===============================

window.updateStatus = async function(id) {

    try {

        const select =
            document.getElementById(
                `status-${id}`
            );


        if (!select) {

            alert("Status selector not found");

            return;

        }


        const status = select.value;


        await updateDoc(
            doc(db, "orders", id),
            {
                status: status
            }
        );


        alert(
            "Order status updated successfully"
        );


        loadOrders();

    }
    catch (error) {

        console.error(
            "Update status error:",
            error
        );


        alert(
            "Update failed:\n" +
            error.message
        );

    }

};



// ===============================
// START
// ===============================

loadOrders();
