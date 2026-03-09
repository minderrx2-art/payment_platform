import express, { Request, Response } from 'express';
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";

import { PaymentService } from "./gen/ts/payment_connect"

const app = express();
app.use(express.json());

const transport = createConnectTransport({
    baseUrl: "http://localhost:8080",
    httpVersion: "1.1"
});

const client = createClient(PaymentService, transport);

app.post('/api/pay', async (req: Request, res: Response) => {
    try {
        const response = await client.processPayment({
            userId: req.body.userId,
            amountCents: BigInt(req.body.amount),
            idempotencyKey: req.body.key
        });
        res.json({ status: "success", paymentId: response.paymentId });
    } catch (err) {
        console.error("Go Engine Error:", err);
        res.status(500).json({ error: "Payment failed" });
    }
});

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: "ok" });
});

app.listen(3000, () => console.log("Gateway at http://localhost:3000"));