const API_URL = window.location.origin;

const WHATSAPP_NUMBER = "255695995956";

let products = [];
let cart = [];


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {

    const container =
        document.getElementById("productsContainer");

    try {

        const response =
            await fetch(`${API_URL}/api/products`);

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to load products"
            );
        }

        products = data.products || [];

        renderProducts();

    } catch (error) {

        console.error(
            "PRODUCT ERROR:",
            error
        );

        container.innerHTML = `
            <p>
                Unable to load products.
                Please make sure the Hans Chapatie server is running.
            </p>
        `;
    }
}


// =====================================================
// DISPLAY PRODUCTS
// =====================================================

function renderProducts() {

    const container =
        document.getElementById("productsContainer");

    if (!products.length) {

        container.innerHTML = `
            <p class="empty">
                No products available.
            </p>
        `;

        return;
    }

    container.innerHTML =
        products.map(product => `

            <div class="product-card">

                <h3>
                    ${escapeHtml(product.name)}
                </h3>

                <p class="product-description">
                    ${escapeHtml(
                        product.description || ""
                    )}
                </p>

                <div class="price">
                    TSh ${formatMoney(product.price)}
                </div>

                <button
                    class="add-button"
                    onclick="addToCart(${product.id})"
                >
                    Add to Order
                </button>

            </div>

        `).join("");
}


// =====================================================
// ADD TO CART
// =====================================================

function addToCart(productId) {

    const product =
        products.find(
            item => item.id === productId
        );

    if (!product) {
        return;
    }

    const existing =
        cart.find(
            item => item.product_id === productId
        );

    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            product_id:
                product.id,

            name:
                product.name,

            price:
                Number(product.price),

            quantity:
                1

        });
    }

    renderCart();
}


// =====================================================
// CHANGE QUANTITY
// =====================================================

function changeQuantity(
    productId,
    amount
) {

    const item =
        cart.find(
            item =>
                item.product_id === productId
        );

    if (!item) {
        return;
    }

    item.quantity += amount;

    if (item.quantity <= 0) {

        cart =
            cart.filter(
                item =>
                    item.product_id !== productId
            );
    }

    renderCart();
}


// =====================================================
// RENDER CART
// =====================================================

function renderCart() {

    const container =
        document.getElementById(
            "cartContainer"
        );

    const totalElement =
        document.getElementById(
            "cartTotal"
        );

    const whatsappButton =
        document.getElementById(
            "whatsappButton"
        );


    if (!cart.length) {

        container.innerHTML = `
            <p class="empty">
                Your order is empty.
            </p>
        `;

        totalElement.textContent =
            "TSh 0";

        whatsappButton.disabled =
            true;

        return;
    }


    container.innerHTML =
        cart.map(item => {

            const subtotal =
                item.price *
                item.quantity;

            return `

                <div class="cart-item">

                    <div>

                        <strong>
                            ${escapeHtml(
                                item.name
                            )}
                        </strong>

                        <br>

                        <small>
                            TSh ${formatMoney(
                                item.price
                            )}
                        </small>

                    </div>


                    <div class="quantity-controls">

                        <button
                            onclick="changeQuantity(
                                ${item.product_id},
                                -1
                            )"
                        >
                            -
                        </button>

                        <strong>
                            ${item.quantity}
                        </strong>

                        <button
                            onclick="changeQuantity(
                                ${item.product_id},
                                1
                            )"
                        >
                            +
                        </button>

                        <strong>
                            TSh ${formatMoney(
                                subtotal
                            )}
                        </strong>

                    </div>

                </div>

            `;

        }).join("");


    const total =
        calculateTotal();


    totalElement.textContent =
        `TSh ${formatMoney(total)}`;


    whatsappButton.disabled =
        false;
}


// =====================================================
// CALCULATE TOTAL
// =====================================================

function calculateTotal() {

    return cart.reduce(
        (total, item) =>
            total +
            (
                item.price *
                item.quantity
            ),
        0
    );
}


// =====================================================
// OPEN CUSTOMER MODAL
// =====================================================

document
    .getElementById("whatsappButton")
    .addEventListener(
        "click",
        () => {

            if (!cart.length) {
                return;
            }

            document
                .getElementById(
                    "customerModal"
                )
                .classList.remove(
                    "hidden"
                );
        }
    );


// =====================================================
// CLOSE MODAL
// =====================================================

function closeModal() {

    document
        .getElementById(
            "customerModal"
        )
        .classList.add(
            "hidden"
        );
}


// =====================================================
// SUBMIT ORDER
// =====================================================


function createWhatsAppMessage(
    order,
    customerName,
    customerPhone,
    customerAddress,
    customerNotes
) {

    let message =
        `HANS CHAPATIE CENTRE\n\n`;


    message +=
        `NEW ORDER\n`;


    message +=
        `Order No: ${order.order_number}\n`;


    message +=
        `Customer: ${customerName}\n`;


    message +=
        `Phone: ${customerPhone}\n`;


    if (customerAddress) {

        message +=
            `Address: ${customerAddress}\n`;
    }


    message +=
        `\nITEMS:\n`;


    cart.forEach(item => {

        const subtotal =
            item.price *
            item.quantity;


        message +=
            `• ${item.name} x${item.quantity} = TSh ${formatMoney(subtotal)}\n`;

    });


    message +=
        `\nTOTAL: TSh ${formatMoney(
            order.total_amount
        )}\n`;


    if (customerNotes) {

        message +=
            `\nNotes: ${customerNotes}\n`;
    }


    message +=
        `\nThank you for ordering from Hans Chapatie Centre.`;


    return message;
}


// =====================================================
// CLEAR CUSTOMER FORM
// =====================================================

function clearCustomerForm() {

    document
        .getElementById(
            "customerName"
        )
        .value = "";


    document
        .getElementById(
            "customerPhone"
        )
        .value = "";


    document
        .getElementById(
            "customerAddress"
        )
        .value = "";


    document
        .getElementById(
            "customerNotes"
        )
        .value = "";
}


// =====================================================
// FORMAT MONEY
// =====================================================

function formatMoney(amount) {

    return Number(amount)
        .toLocaleString(
            "en-TZ"
        );
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    return String(value ?? "")

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


// =====================================================
// INITIALIZE
// =====================================================

loadProducts();

renderCart();



/* ================================
   HANS CHAPATIE PRODUCT SYSTEM
================================ */

async function loadProducts() {

    const container =
        document.querySelector("#products") ||
        document.querySelector(".products");

    if (!container) {
        console.error("Products container not found.");
        return;
    }

    try {

        const response = await fetch("/api/products", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("API returned HTTP " + response.status);
        }

        const data = await response.json();

        const products = Array.isArray(data.products)
            ? data.products
            : [];

        if (!products.length) {

            container.innerHTML = `
                <div class="no-products">
                    <h3>No products available</h3>
                </div>
            `;

            return;
        }

        container.innerHTML = products.map(product => `

            <article class="product-card">

                ${product.image
                    ? `
                        <img
                            src="${escapeHtml(product.image)}"
                            alt="${escapeHtml(product.name)}"
                            loading="lazy"
                        >
                    `
                    : ""
                }

                <div class="product-card-content">

                    <h3>${escapeHtml(product.name)}</h3>

                    <p>
                        ${escapeHtml(product.description || "")}
                    </p>

                    <strong>
                        TZS ${Number(product.price).toLocaleString()}
                    </strong>

                    <br><br>

                    <button
                        type="button"
                        class="order-product"
                        data-product-id="${product.id}">
                        Order Now
                    </button>

                </div>

            </article>

        `).join("");

        document
            .querySelectorAll(".order-product")
            .forEach(button => {

                button.addEventListener("click", () => {

                    // Vibration feedback on supported phones
                    if ("vibrate" in navigator) {
                        navigator.vibrate([80, 40, 80]);
                    }

                    // Small visual feedback
                    button.classList.add("order-clicked");

                    setTimeout(() => {
                        button.classList.remove("order-clicked");
                    }, 250);

                    const productId =
                        button.getAttribute("data-product-id");

                    openOrderForm(productId);
                });

            });

    } catch (error) {

        console.error("PRODUCT ERROR:", error);

        container.innerHTML = `
            <div class="no-products">
                <h3>Unable to load products</h3>
                <p>Please try again.</p>
            </div>
        `;
    }
}


/* ================================
   ORDER FORM
================================ */

let selectedProduct = null;

async function openOrderForm(productId) {

    try {

        const response =
            await fetch("/api/products/" + productId);

        const data = await response.json();

        if (!response.ok || !data.success) {
            alert("Product not found.");
            return;
        }

        selectedProduct = data.product;

        showOrderPage();

    } catch (error) {

        console.error("PRODUCT ERROR:", error);

        alert("Unable to open order form.");
    }
}


function showOrderPage() {

    if ("vibrate" in navigator) {
        navigator.vibrate([80, 40, 80]);
    }

    let page = document.getElementById("order-page");

    if (!page) {

        page = document.createElement("div");

        page.id = "order-page";

        page.innerHTML = `
            <div class="order-page-overlay">

                <div class="order-page-card">

                    <button
                        type="button"
                        id="close-order-page"
                        class="close-order-page">
                        ×
                    </button>

                    <div class="order-header">

                        <h2>Place Your Order</h2>

                        <p>
                            Enter your information below
                        </p>

                    </div>

                    <div class="selected-product">

                        <h3 id="order-product-name"></h3>

                        <p id="order-product-description"></p>

                        <strong id="order-product-price"></strong>

                    </div>

                    <form id="customer-order-form">

                        <label for="customer-name">
                            Full Name
                        </label>

                        <input
                            id="customer-name"
                            type="text"
                            placeholder="Enter your full name"
                            required
                            autocomplete="name"
                        >

                        <label for="customer-phone">
                            Phone Number
                        </label>

                        <input
                            id="customer-phone"
                            type="tel"
                            placeholder="07XXXXXXXX"
                            required
                            autocomplete="tel"
                        >

                        <label for="customer-address">
                            Delivery Location
                        </label>

                        <input
                            id="customer-address"
                            type="text"
                            placeholder="Enter your delivery location"
                            required
                            autocomplete="street-address"
                        >

                        <label for="customer-quantity">
                            Quantity
                        </label>

                        <input
                            id="customer-quantity"
                            type="number"
                            min="1"
                            value="1"
                            required
                        >

                        <label for="customer-notes">
                            Additional Notes
                        </label>

                        <textarea
                            id="customer-notes"
                            rows="3"
                            placeholder="Optional instructions">
                        </textarea>

                        <div class="order-total-box">

                            <span>
                                Total
                            </span>

                            <strong id="order-total">
                                TZS 0
                            </strong>

                        </div>

                        <button
                            type="submit"
                            id="place-order-button"
                            class="place-order-button">

                            Place Order

                        </button>

                    </form>

                </div>

            </div>
        `;

        document.body.appendChild(page);

        document
            .getElementById("close-order-page")
            .addEventListener("click", closeOrderPage);

        document
            .getElementById("customer-quantity")
            .addEventListener("input", updateOrderTotal);

        document
            .getElementById("customer-order-form")
            .addEventListener("submit", submitOrder);

    }

    document.body.classList.add("order-page-open");

    document.getElementById("order-product-name").textContent =
        selectedProduct.name;

    document.getElementById("order-product-description").textContent =
        selectedProduct.description || "";

    document.getElementById("order-product-price").textContent =
        "TZS " +
        Number(selectedProduct.price).toLocaleString();

    document.getElementById("customer-quantity").value = 1;

    updateOrderTotal();

    setTimeout(() => {
        document
            .getElementById("customer-name")
            .focus();
    }, 100);
}


function updateOrderTotal() {

    if (!selectedProduct) {
        return;
    }

    const quantity =
        Number(
            document.getElementById("customer-quantity").value
        ) || 1;

    const total =
        Number(selectedProduct.price) * quantity;

    document.getElementById("order-total").textContent =
        "TZS " + total.toLocaleString();
}


function closeOrderPage() {

    const page =
        document.getElementById("order-page");

    if (page) {
        page.remove();
    }

    document.body.classList.remove("order-page-open");

    selectedProduct = null;
}


async function submitOrder(event) {

    event.preventDefault();

    if (!selectedProduct) {
        return;
    }

    const button =
        document.getElementById("place-order-button");

    const name =
        document.getElementById("customer-name").value.trim();

    const phone =
        document.getElementById("customer-phone").value.trim();

    const address =
        document.getElementById("customer-address").value.trim();

    const quantity =
        Number(
            document.getElementById("customer-quantity").value
        );

    const notes =
        document.getElementById("customer-notes").value.trim();

    if (!name || !phone || !address) {

        alert(
            "Please complete all required information."
        );

        return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {

        alert(
            "Please enter a valid quantity."
        );

        return;
    }

    const total =
        Number(selectedProduct.price) * quantity;

    if ("vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]);
    }

    button.disabled = true;

    button.textContent =
        "Placing Order...";

    try {

        const response =
            await fetch("/api/orders", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },

                body: JSON.stringify({

                    productId:
                        selectedProduct.id,

                    quantity,

                    customerName:
                        name,

                    phone:
                        phone,

                    address:
                        address,

                    notes

                })

            });

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.error || "Order failed"
            );
        }

        if ("vibrate" in navigator) {
            navigator.vibrate([100, 50, 100, 50, 150]);
        }

        document
            .querySelector(".order-page-card")
            .innerHTML = `

                <div class="order-success">

                    <div class="success-icon">
                        ✓
                    </div>

                    <h2>
                        Order Received!
                    </h2>

                    <p>
                        Thank you, ${escapeHtml(name)}.
                    </p>

                    <div class="success-order-summary">

                        <p>
                            <strong>
                                ${escapeHtml(selectedProduct.name)}
                            </strong>
                        </p>

                        <p>
                            Quantity:
                            ${quantity}
                        </p>

                        <p>
                            Total:
                            <strong>
                                TZS ${total.toLocaleString()}
                            </strong>
                        </p>

                    </div>

                    <button
                        type="button"
                        class="place-order-button"
                        onclick="closeOrderPage()">

                        Done

                    </button>

                </div>
            `;

    } catch (error) {

        console.error(
            "ORDER ERROR:",
            error
        );

        button.disabled = false;

        button.textContent =
            "Place Order";

        alert(
            "Unable to place your order. Please try again."
        );
    }
}

/* ================================
   HTML SAFETY
================================ */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* ================================
   START
================================ */

document.addEventListener(
    "DOMContentLoaded",
    loadProducts
);


async function submitOrder(order) {
    const button = document.querySelector("#place-order, .place-order, [type='submit']");
    if (button) {
        button.disabled = true;
        button.textContent = "Processing...";
    }

    try {
        /*
         * Save the order first.
         * This will work when the API is available.
         */
        let savedOrder = null;

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(order)
            });

            if (response.ok) {
                savedOrder = await response.json();
            }
        } catch (apiError) {
            console.warn("Order API unavailable:", apiError);
        }

        const orderNumber =
            savedOrder?.order?.order_number ||
            savedOrder?.order_number ||
            ("HC-" + Date.now().toString().slice(-8));

        const items = Array.isArray(order.items)
            ? order.items
            : [];

        const itemText = items.length
            ? items.map(item => {
                const name = item.name || item.product_name || "Product";
                const qty = Number(item.quantity || 1);
                const price = Number(item.price || 0);
                return `${name} x${qty} = TZS ${(price * qty).toLocaleString()}`;
            }).join("\n")
            : "Order details unavailable";

        const total = Number(order.total || 0);

        const message =
`HANS CHAPATIE CENTRE - NEW ORDER

Order No: ${orderNumber}

CUSTOMER
Name: ${order.customer_name || order.name || ""}
Phone: ${order.customer_phone || order.phone || ""}
Address: ${order.address || ""}

ORDER
${itemText}

TOTAL: TZS ${total.toLocaleString()}

Notes: ${order.notes || "None"}

Please confirm this order.`;

        /*
         * Open WhatsApp with the complete order.
         * Customer only needs to press SEND.
         */
        const whatsappURL =
            "https://wa.me/${WHATSAPP}?text=" +
            encodeURIComponent(message);

        window.location.href = whatsappURL;

    } catch (error) {
        console.error("Order error:", error);
        alert("Unable to process the order. Please try again.");
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "Place Order";
        }
    }
}




// ============================================================
// HANS CHAPATIE CENTRE - CUSTOMER ORDER SYSTEM
// ============================================================

const HANS_WHATSAPP = "255695995956";

document.addEventListener("click", function (event) {

    const button = event.target.closest(".order-product");

    if (!button) return;

    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }

    const productId = button.dataset.productId;

    let product = null;

    if (Array.isArray(window.products)) {
        product = window.products.find(
            p => String(p.id) === String(productId)
        );
    }

    if (!product) {
        try {
            const products = JSON.parse(
                sessionStorage.getItem("hans_products") || "[]"
            );

            product = products.find(
                p => String(p.id) === String(productId)
            );
        } catch (_) {}
    }

    const productName =
        product?.name ||
        button.dataset.productName ||
        "Chapati";

    const productPrice =
        Number(product?.price || button.dataset.productPrice || 0);

    showCustomerOrderForm(
        productName,
        productPrice,
        productId
    );
});


function showCustomerOrderForm(
    productName,
    productPrice,
    productId
) {

    const old = document.getElementById(
        "customer-order-modal"
    );

    if (old) old.remove();

    const modal = document.createElement("div");

    modal.id = "customer-order-modal";

    modal.innerHTML = `

        <div class="order-modal-overlay">

            <div class="order-modal">

                <button
                    type="button"
                    class="close-order-modal">
                    ×
                </button>

                <h2>Complete Your Order</h2>

                <div class="selected-product">

                    <strong>${escapeHtml(productName)}</strong>

                    <div>
                        Price:
                        <strong>
                            TZS ${productPrice.toLocaleString("en-TZ")}
                        </strong>
                    </div>

                </div>

                <form id="customer-order-form">

                    <label>
                        Full Name
                        <input
                            id="customer-name"
                            type="text"
                            required
                            placeholder="Enter your full name">
                    </label>

                    <label>
                        Phone Number
                        <input
                            id="customer-phone"
                            type="tel"
                            required
                            placeholder="07XXXXXXXX">
                    </label>

                    <label>
                        Delivery Location
                        <textarea
                            id="customer-address"
                            required
                            placeholder="Enter your location"></textarea>
                    </label>

                    <label>
                        Quantity
                        <input
                            id="customer-quantity"
                            type="number"
                            min="1"
                            value="1"
                            required>
                    </label>

                    <div class="order-summary">

                        <div>
                            Unit Price:
                            <strong>
                                TZS ${productPrice.toLocaleString("en-TZ")}
                            </strong>
                        </div>

                        <div>
                            Quantity:
                            <strong id="order-quantity-display">
                                1
                            </strong>
                        </div>

                        <div class="order-total">

                            TOTAL:

                            <strong id="order-total-display">
                                TZS ${productPrice.toLocaleString("en-TZ")}
                            </strong>

                        </div>

                    </div>

                    <button
                        type="submit"
                        class="send-whatsapp-order">

                        Order on WhatsApp

                    </button>

                </form>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    const quantityInput =
        document.getElementById(
            "customer-quantity"
        );

    const quantityDisplay =
        document.getElementById(
            "order-quantity-display"
        );

    const totalDisplay =
        document.getElementById(
            "order-total-display"
        );

    function updateTotal() {

        let quantity =
            Number(quantityInput.value);

        if (!Number.isFinite(quantity) || quantity < 1) {
            quantity = 1;
            quantityInput.value = 1;
        }

        const total =
            productPrice * quantity;

        quantityDisplay.textContent =
            quantity.toLocaleString("en-TZ");

        totalDisplay.textContent =
            "TZS " +
            total.toLocaleString("en-TZ");
    }

    quantityInput.addEventListener(
        "input",
        updateTotal
    );

    quantityInput.addEventListener(
        "change",
        updateTotal
    );

    updateTotal();

    document
        .querySelector(".close-order-modal")
        .addEventListener(
            "click",
            () => modal.remove()
        );

    document
        .querySelector(".order-modal-overlay")
        .addEventListener(
            "click",
            function (event) {

                if (event.target === this) {
                    modal.remove();
                }

            }
        );

    document
        .getElementById("customer-order-form")
        .addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const name =
                    document
                        .getElementById("customer-name")
                        .value
                        .trim();

                const phone =
                    document
                        .getElementById("customer-phone")
                        .value
                        .trim();

                const address =
                    document
                        .getElementById("customer-address")
                        .value
                        .trim();

                const quantity =
                    Number(quantityInput.value);

                if (
                    !name ||
                    !phone ||
                    !address ||
                    quantity < 1
                ) {

                    alert(
                        "Please complete all customer information."
                    );

                    return;
                }

                const total =
                    productPrice * quantity;

                if (navigator.vibrate) {
                    navigator.vibrate(
                        [150, 70, 150]
                    );
                }

                /*
                 * POLITE WHATSAPP MESSAGE
                 */

                const message =

`🫓 *HANS CHAPATIE CENTRE*

Hello Hans Chapatie Centre 👋

I would like to place an order.

━━━━━━━━━━━━━━━━━━

🛒 *ORDER DETAILS*

Product: ${productName}
Quantity: ${quantity}
Unit Price: TZS ${productPrice.toLocaleString("en-TZ")}

💰 *TOTAL: TZS ${total.toLocaleString("en-TZ")}*

━━━━━━━━━━━━━━━━━━

👤 *CUSTOMER INFORMATION*

Name: ${name}
Phone: ${phone}
Location: ${address}

━━━━━━━━━━━━━━━━━━

Thank you very much. Please confirm my order and let me know when it is ready. 🙏

I look forward to receiving my order from Hans Chapatie Centre. ❤️`;

                const whatsappURL =
                    "https://wa.me/" +
                    HANS_WHATSAPP +
                    "?text=" +
                    encodeURIComponent(message);

                /*
                 * SAVE ORDER LOCALLY
                 */

                try {

                    const orders =
                        JSON.parse(
                            localStorage.getItem(
                                "hans_orders"
                            ) || "[]"
                        );

                    orders.push({

                        id:
                            Date.now(),

                        productId,

                        product:
                            productName,

                        price:
                            productPrice,

                        quantity,

                        total,

                        customerName:
                            name,

                        customerPhone:
                            phone,

                        address,

                        createdAt:
                            new Date()
                                .toISOString()

                    });

                    localStorage.setItem(
                        "hans_orders",
                        JSON.stringify(orders)
                    );

                } catch (_) {}

                /*
                 * OPEN WHATSAPP
                 */

                window.location.href =
                    whatsappURL;
            }
        );
}
