const https = require("https");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed" })
        };
    }

    try {
        const order = JSON.parse(event.body || "{}");

        if (!order.customerName || !order.customerPhone || !order.items || !order.total) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Missing customer or order information"
                })
            };
        }

        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const businessNumber = "255695995956";

        if (!phoneNumberId || !accessToken) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "WhatsApp API credentials are not configured"
                })
            };
        }

        const items = order.items.map(item =>
            `• ${item.name} × ${item.quantity} — TZS ${Number(item.price * item.quantity).toLocaleString()}`
        ).join("\n");

        const message =
`🔔 NEW HANS CHAPATIE ORDER

Order received successfully.

👤 Customer: ${order.customerName}
📞 Phone: ${order.customerPhone}
📍 Location: ${order.location || "Not provided"}

🛒 ORDER:
${items}

💰 TOTAL: TZS ${Number(order.total).toLocaleString()}

Thank you for ordering from Hans Chapatie Centre. 🙏`;

        const payload = JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: businessNumber,
            type: "text",
            text: {
                preview_url: false,
                body: message
            }
        });

        const response = await new Promise((resolve, reject) => {
            const req = https.request(
                `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                        "Content-Length": Buffer.byteLength(payload)
                    }
                },
                res => {
                    let data = "";

                    res.on("data", chunk => {
                        data += chunk;
                    });

                    res.on("end", () => {
                        resolve({
                            status: res.statusCode,
                            data
                        });
                    });
                }
            );

            req.on("error", reject);
            req.write(payload);
            req.end();
        });

        if (response.status < 200 || response.status >= 300) {
            console.error("WhatsApp API error:", response.data);

            return {
                statusCode: 502,
                body: JSON.stringify({
                    error: "WhatsApp rejected the order message",
                    details: response.data
                })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: "Order sent to WhatsApp"
            })
        };

    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Unable to send WhatsApp order"
            })
        };
    }
};
