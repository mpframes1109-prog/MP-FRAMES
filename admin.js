import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const productList = document.getElementById("product-list");

// Add Product
window.addProduct = async function () {

    const name = document.getElementById("name").value.trim();
    const price = document.getElementById("price").value.trim();
    const image = document.getElementById("image").value.trim();

    if(name==="" || price==="" || image===""){
        alert("Please fill all fields");
        return;
    }

    await addDoc(collection(db,"products"),{
        name:name,
        price:Number(price),
        image:image
    });

    document.getElementById("name").value="";
    document.getElementById("price").value="";
    document.getElementById("image").value="";

    alert("Product Added Successfully");

    loadProducts();

}

// Load Products
async function loadProducts(){

    productList.innerHTML="";

    const snapshot=await getDocs(collection(db,"products"));

    snapshot.forEach((item)=>{

        const product=item.data();

        productList.innerHTML+=`
        <div style="
        background:white;
        padding:15px;
        border-radius:10px;
        text-align:center;
        box-shadow:0 0 10px rgba(0,0,0,.1);
        ">

        <img src="${product.image}" width="180">

        <h3>${product.name}</h3>

        <h4>₹${product.price}</h4>

        <button onclick="deleteProduct('${item.id}')">
        Delete
        </button>

        </div>
        `;

    });

}

// Delete Product
window.deleteProduct = async function(id){

    await deleteDoc(doc(db,"products",id));

    loadProducts();

}

loadProducts();
