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

async function submitOrder() {

    const customerName =
        document
            .getElementById(
                "customerName"
            )
            .value
            .trim();


    const customerPhone =
        document
            .getElementById(
                "customerPhone"
            )
            .value
            .trim();


    const customerAddress =
        document
            .getElementById(
                "customerAddress"
            )
            .value
            .trim();


    const customerNotes =
        document
            .getElementById(
                "customerNotes"
            )
            .value
            .trim();


    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    if (!customerName) {

        alert(
            "Please enter your name."
        );

        return;
    }


    if (!customerPhone) {

        alert(
            "Please enter your phone number."
        );

        return;
    }


    if (!cart.length) {

        alert(
            "Your order is empty."
        );

        return;
    }


    // ---------------------------------------------
    // PREPARE ORDER
    // ---------------------------------------------

    const orderData = {

        customer_name:
            customerName,

        phone:
            customerPhone,

        address:
            customerAddress,

        notes:
            customerNotes,

        items:
            cart.map(item => ({

                product_id:
                    item.product_id,

                quantity:
                    item.quantity

            }))

    };


    const submitButton =
        document.querySelector(
            ".submit-button"
        );


    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Creating Order...";
    }


    try {

        // -----------------------------------------
        // SEND ORDER TO BACKEND
        // -----------------------------------------

        const response =
            await fetch(
                `${API_URL}/api/orders`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            orderData
                        )
                }
            );


        const data =
            await response.json();


        // -----------------------------------------
        // CHECK SERVER RESPONSE
        // -----------------------------------------

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                data.message ||
                "Unable to create order"
            );
        }


        const order =
            data.order;


        // -----------------------------------------
        // CREATE WHATSAPP MESSAGE
        // -----------------------------------------

        const message =
            createWhatsAppMessage(
                order,
                customerName,
                customerPhone,
                customerAddress,
                customerNotes
            );


        const whatsappURL =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${
                encodeURIComponent(message)
            }`;


        // -----------------------------------------
        // SUCCESS
        // -----------------------------------------

        alert(
            `Order ${order.order_number} created successfully!`
        );


        // -----------------------------------------
        // OPEN WHATSAPP
        // -----------------------------------------

        window.open(
            whatsappURL,
            "_blank"
        );


        // -----------------------------------------
        // CLEAR ORDER
        // -----------------------------------------

        cart = [];

        renderCart();

        closeModal();

        clearCustomerForm();


    } catch (error) {

        console.error(
            "ORDER ERROR:",
            error
        );


        alert(
            `Failed to place order:\n${error.message}`
        );


    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Place Order";
        }
    }
}


// =====================================================
// CREATE WHATSAPP MESSAGE
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
