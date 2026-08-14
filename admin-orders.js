import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const table = document.getElementById("ordersTable");


async function loadOrders() {

    try {

        table.innerHTML = "";

        const snapshot = await getDocs(
            collection(db, "orders")
        );


        if (snapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="13" class="empty">
                        No Orders Found
                    </td>
                </tr>
            `;

            return;
        }


        snapshot.forEach((document) => {

            const order = document.data();

            const id = document.id;


            // -----------------------------
            // PAYMENT STATUS
            // -----------------------------

            const paymentStatus =
                order.paymentStatus ||
                "Not Paid";


            let paymentHTML = "";

            if (
                String(paymentStatus).toLowerCase() === "paid"
            ) {

                paymentHTML = `
                    <span class="paid">
                        ✅ Paid
                    </span>
                `;

            } else {

                paymentHTML = `
                    <span class="not-paid">
                        ❌ Not Paid
                    </span>
                `;

            }


            // -----------------------------
            // ORDER STATUS
            // -----------------------------

            const orderStatus =
                order.orderStatus ||
                order.status ||
                "Pending";


            // -----------------------------
            // DATE
            // -----------------------------

            let orderDate = "";

            if (order.createdAt) {

                try {

                    if (
                        typeof order.createdAt.toDate ===
                        "function"
                    ) {

                        orderDate =
                            order.createdAt
                                .toDate()
                                .toLocaleString();

                    } else {

                        orderDate =
                            new Date(
                                order.createdAt
                            ).toLocaleString();

                    }

                } catch (error) {

                    orderDate = "";

                }

            }


            // -----------------------------
            // FRAME IMAGE
            // -----------------------------

            const frameImage =
                order.image ||
                order.productImage ||
                order.frameImage ||
                "";


            let frameImageHTML =
                `<span class="no-photo">No Frame Image</span>`;


            if (frameImage) {

                frameImageHTML = `
                    <img
                        src="${frameImage}"
                        class="frame-image"
                        alt="Frame Image"
                    >

                    <div class="photo-buttons">

                        <a
                            href="${frameImage}"
                            target="_blank"
                            class="view-btn"
                        >
                            🔍 View
                        </a>

                        <a
                            href="${frameImage}"
                            target="_blank"
                            download
                            class="download-btn"
                        >
                            ⬇ Download
                        </a>

                    </div>
                `;

            }


            // -----------------------------
            // CUSTOMER UPLOADED PHOTO
            // -----------------------------

            const customerPhoto =
                order.photo ||
                order.photoURL ||
                "";


            let customerPhotoHTML =
                `<span class="no-photo">No Photo</span>`;


            if (customerPhoto) {

                customerPhotoHTML = `
                    <img
                        src="${customerPhoto}"
                        class="customer-image"
                        alt="Customer Photo"
                    >

                    <div class="photo-buttons">

                        <a
                            href="${customerPhoto}"
                            target="_blank"
                            class="view-btn"
                        >
                            🔍 View
                        </a>

                        <a
                            href="${customerPhoto}"
                            target="_blank"
                            download
                            class="download-btn"
                        >
                            ⬇ Download
                        </a>

                    </div>
                `;

            }


            // -----------------------------
            // ADD ROW
            // -----------------------------

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


                    <!-- FRAME NAME -->

                    <td>
                        ${order.frameName || ""}
                    </td>


                    <!-- FRAME IMAGE -->

                    <td>
                        ${frameImageHTML}
                    </td>


                    <!-- QUANTITY -->

                    <td>
                        ${order.quantity || 1}
                    </td>


                    <!-- PRICE -->

                    <td>
                        ₹${Number(order.price || 0)}
                    </td>


                    <!-- CUSTOMER PHOTO -->

                    <td>
                        ${customerPhotoHTML}
                    </td>


                    <!-- MESSAGE -->

                    <td>
                        ${order.message || ""}
                    </td>


                    <!-- PAYMENT -->

                    <td>
                        ${paymentHTML}
                    </td>


                    <!-- STATUS -->

                    <td>

                        <select
                            id="status-${id}"
                        >

                            <option
                                value="Pending"
                                ${
                                    orderStatus === "Pending"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Pending
                            </option>


                            <option
                                value="Confirmed"
                                ${
                                    orderStatus === "Confirmed"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Confirmed
                            </option>


                            <option
                                value="Delivered"
                                ${
                                    orderStatus === "Delivered"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Delivered
                            </option>

                        </select>

                    </td>


                    <!-- UPDATE -->

                    <td>

                        <button
                            class="update-btn"
                            onclick="updateStatus('${id}')"
                        >
                            Update
                        </button>

                    </td>


                    <!-- DATE -->

                    <td>
                        ${orderDate}
                    </td>

                </tr>

            `;

        });


    } catch (error) {

        console.error(
            "Error loading orders:",
            error
        );


        table.innerHTML = `

            <tr>

                <td
                    colspan="13"
                    class="empty"
                >

                    ❌ Error loading orders

                    <br><br>

                    ${error.message}

                </td>

            </tr>

        `;

    }

}



// ------------------------------------
// UPDATE ORDER STATUS
// ------------------------------------

window.updateStatus = async function (id) {

    try {

        const select =
            document.getElementById(
                `status-${id}`
            );


        if (!select) {

            alert("Status selector not found");

            return;

        }


        const newStatus =
            select.value;


        await updateDoc(

            doc(
                db,
                "orders",
                id
            ),

            {
                orderStatus: newStatus,
                status: newStatus
            }

        );


        alert(
            "Order status updated successfully!"
        );


        await loadOrders();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            "Update failed!\n\n" +
            error.message
        );

    }

};



// ------------------------------------
// LOAD ORDERS
// ------------------------------------

loadOrders();
