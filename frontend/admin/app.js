const API_URL = window.location.origin;


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/dashboard`
            );

        const data =
            await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        const dashboard =
            data.dashboard;

        document.getElementById(
            "totalOrders"
        ).textContent =
            dashboard.total_orders;

        document.getElementById(
            "totalSales"
        ).textContent =
            `TSh ${formatMoney(dashboard.total_sales)}`;

        document.getElementById(
            "newOrders"
        ).textContent =
            dashboard.new_orders;

        document.getElementById(
            "pendingPayments"
        ).textContent =
            dashboard.pending_payments;

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    const container =
        document.getElementById(
            "ordersContainer"
        );

    container.innerHTML =
        "<p>Loading orders...</p>";

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/orders`
            );

        const data =
            await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        if (!data.orders.length) {

            container.innerHTML = `
                <p>No orders found.</p>
            `;

            return;
        }

        container.innerHTML =
            data.orders
                .map(order => createOrderCard(order))
                .join("");

    } catch (error) {

        console.error(
            "Orders error:",
            error
        );

        container.innerHTML = `
            <p>
                Failed to load orders.
            </p>
        `;
    }

}


// ==========================================
// ORDER CARD
// ==========================================

function createOrderCard(order) {

    const statuses = [
        "NEW",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "DELIVERED",
        "CANCELLED"
    ];

    const options =
        statuses.map(status => `
            <option
                value="${status}"
                ${order.status === status ? "selected" : ""}
            >
                ${status}
            </option>
        `).join("");

    return `

        <div class="order-card">

            <div class="order-header">

                <div>

                    <div class="order-number">
                        ${order.order_number}
                    </div>

                    <small>
                        ${formatDate(order.created_at)}
                    </small>

                </div>

                <div class="order-total">
                    TSh ${formatMoney(order.total_amount)}
                </div>

            </div>


            <div class="customer-info">

                <strong>Customer</strong><br>

                ${escapeHtml(order.customer_name)}

                <br>

                Phone:
                ${escapeHtml(order.customer_phone)}

                <br>

                Address:
                ${escapeHtml(order.customer_address || "Not provided")}

                <br>

                Payment:
                <span class="payment">
                    ${order.payment_status}
                </span>

                <br>

                Notes:
                ${escapeHtml(order.notes || "None")}

            </div>


            <div class="status-row">

                <span>
                    Status:
                </span>

                <select
                    class="status-select"
                    id="status-${order.id}"
                >
                    ${options}
                </select>

                <button
                    class="save-status"
                    onclick="updateStatus(${order.id})"
                >
                    Save
                </button>

            </div>

        </div>
    `;
}


// ==========================================
// UPDATE STATUS
// ==========================================

async function updateStatus(orderId) {

    const select =
        document.getElementById(
            `status-${orderId}`
        );

    const status =
        select.value;

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/orders/${orderId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );

        const data =
            await response.json();

        if (!data.success) {
            throw new Error(
                data.message || data.error
            );
        }

        alert(
            "Order status updated successfully."
        );

        loadDashboard();
        loadOrders();

    } catch (error) {

        console.error(error);

        alert(
            `Failed to update status: ${error.message}`
        );

    }

}


// ==========================================
// FORMAT MONEY
// ==========================================

function formatMoney(amount) {

    return Number(amount).toLocaleString(
        "en-TZ"
    );

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {

    return new Date(date).toLocaleString(
        "en-TZ",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// INITIALIZE
// ==========================================

async function initialize() {

    await loadDashboard();

    await loadOrders();

}

initialize();


// Refresh dashboard every 30 seconds

setInterval(() => {

    loadDashboard();
    loadOrders();

}, 30000);
