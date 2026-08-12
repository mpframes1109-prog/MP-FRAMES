import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const table = document.getElementById("ordersTable");


async function loadOrders() {

    table.innerHTML = `
        <tr>
            <td colspan="9">Loading orders...</td>
        </tr>
    `;


    try {

        const ordersQuery = query(
            collection(db, "orders"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(ordersQuery);


        if (snapshot.empty) {

            table.innerHTML = `
                <tr>
                    <td colspan="9">
                        No customer orders found
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML = "";


        snapshot.forEach((document) => {

            const order = document.data();

            const photo = order.photo
                ? `
                    <img
                        src="${order.photo}"
                        class="order-image"
                        alt="Customer Photo"
                    >
                  `
                : "No Photo";


            const viewButton = order.photo
                ? `
                    <button
                        class="view-btn"
                        onclick="viewImage('${order.photo}')">
                        👁️ View
                    </button>
                  `
                : "";


            const downloadButton = order.photo
                ? `
                    <a
                        class="download-btn"
                        href="${order.photo}"
                        target="_blank"
                        download>
                        ⬇️ Download
                    </a>
                  `
                : "";


            table.innerHTML += `

                <tr>

                    <td>
                        <strong>
                            ${order.customerName || ""}
                        </strong>
                    </td>


                    <td>
                        ${order.phone || ""}
                    </td>


                    <td>
                        ${order.address || ""}
                    </td>


                    <td>
                        ${order.frameName || ""}
                        <br>
                        <small>
                            Qty: ${order.quantity || 1}
                        </small>
                    </td>


                    <td>
                        ₹${order.price || 0}
                    </td>


                    <td>
                        ${photo}
                    </td>


                    <td>

                        <select
                            id="status-${document.id}"
                            class="status-select">

                            <option
                                value="Pending"
                                ${order.status === "Pending" ? "selected" : ""}>
                                Pending
                            </option>

                            <option
                                value="Confirmed"
                                ${order.status === "Confirmed" ? "selected" : ""}>
                                Confirmed
                            </option>

                            <option
                                value="Delivered"
                                ${order.status === "Delivered" ? "selected" : ""}>
                                Delivered
                            </option>

                        </select>

                    </td>


                    <td class="actions">

                        ${viewButton}

                        ${downloadButton}

                        <button
                            class="update-btn"
                            onclick="updateStatus('${document.id}')">
                            ✅ Update
                        </button>

                    </td>

                </tr>

            `;

        });


    } catch (error) {

        console.error("Load orders error:", error);

        table.innerHTML = `
            <tr>
                <td colspan="9">
                    ❌ Failed to load orders
                    <br>
                    ${error.message}
                </td>
            </tr>
        `;
    }

}



/* VIEW IMAGE */

window.viewImage = function(url) {

    window.open(url, "_blank");

};



/* UPDATE STATUS */
window.updateStatus = async function(id) {

    try {

        const select = document.getElementById(`status-${id}`);
        const button = event.target;

        const status = select.value;

        button.disabled = true;
        button.innerText = "Updating...";

        await updateDoc(doc(db, "orders", id), {
            status: status
        });

        button.disabled = false;
        button.innerText = "Updated";

        setTimeout(() => {
            button.innerText = "Update";
        }, 1500);

    } catch (error) {

        console.error("Status update error:", error);

        alert("Update failed: " + error.message);

        event.target.disabled = false;
        event.target.innerText = "Update";
    }

};

