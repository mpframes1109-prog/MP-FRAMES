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
                    <td colspan="11">
                        No Orders Found
                    </td>
                </tr>
            `;

            return;
        }


        snapshot.forEach((document) => {

            const order = document.data();

            const id = document.id;


            // Payment status
            const paymentStatus =
                order.paymentStatus ||
                order.status ||
                "Not Paid";


            // Order status
            const orderStatus =
                order.orderStatus ||
                "Pending";


            // Date
            let orderDate = "";

            if (order.createdAt) {

                try {

                    if (order.createdAt.toDate) {

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

                } catch (e) {

                    orderDate = "";

                }

            }


            // PHOTO
let photoHTML = "No Photo";

if (order.photo && order.photo !== "") {

    photoHTML = `
        <img
            src="${order.photo}"
            width="90"
            height="90"
            style="width:90px;height:90px;object-fit:cover;border-radius:8px;display:block;margin:auto;"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        >

        <div style="display:none;color:red;font-size:12px;">
            Image Error
        </div>

        <div style="margin-top:8px;display:flex;flex-direction:column;gap:5px;">

            <a href="${order.photo}" target="_blank"
               style="background:#2196F3;color:white;padding:6px;border-radius:5px;text-decoration:none;">
               🔍 View
            </a>

            <a href="${order.photo}" target="_blank" download
               style="background:#673AB7;color:white;padding:6px;border-radius:5px;text-decoration:none;">
               ⬇ Download
            </a>

        </div>
    `;
}

            // Payment display
            let paymentHTML = "";

            if (
                paymentStatus.toLowerCase() === "paid"
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


            table.innerHTML += `

                <tr>

                    <td>
                        ${order.customerName || ""}
                    </td>


                    <td>
                        ${order.phone || ""}
                    </td>


                    <td>
                        ${order.address || ""}
                    </td>


                    <td>
                        ${order.frameName || ""}
                    </td>


                    <td>
                        ${order.quantity || 1}
                    </td>


                    <td>
                        ₹${order.price || 0}
                    </td>


                    <td>
                        ${photoHTML}
                    </td>


                    <td>
                        ${paymentHTML}
                    </td>


                    <td>

                        <select
                            id="status-${id}"
                        >

                            <option
                                value="Pending"
                                ${orderStatus === "Pending"
                                    ? "selected"
                                    : ""}
                            >
                                Pending
                            </option>

                            <option
                                value="Confirmed"
                                ${orderStatus === "Confirmed"
                                    ? "selected"
                                    : ""}
                            >
                                Confirmed
                            </option>

                            <option
                                value="Delivered"
                                ${orderStatus === "Delivered"
                                    ? "selected"
                                    : ""}
                            >
                                Delivered
                            </option>

                        </select>

                    </td>


                    <td>

                        <button
                            class="update-btn"
                            onclick="updateStatus('${id}')"
                        >
                            Update
                        </button>

                    </td>


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

                <td colspan="11">

                    ❌ Error loading orders

                    <br><br>

                    ${error.message}

                </td>

            </tr>

        `;

    }

}



window.updateStatus = async function(id) {

    try {

        const select =
            document.getElementById(
                `status-${id}`
            );


        const newStatus =
            select.value;


        await updateDoc(
            doc(db, "orders", id),
            {
                orderStatus: newStatus
            }
        );


        alert(
            "Order status updated successfully!"
        );


        loadOrders();


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


loadOrders();
