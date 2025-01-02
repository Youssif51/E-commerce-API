import axios from "axios";
import dotenv from "dotenv";
import { getPayPalToken } from "../config/paypalConfig";
dotenv.config();

const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

export const createOrder = async (amount: number) => {
  const token = await getPayPalToken();
  //console.log(token);

  const response = await axios.post(
    `${PAYPAL_API_BASE}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount.toFixed(2),
          },
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const capturePayment = async (transactionId: string) => {
  const token = await getPayPalToken();
  console.log(token);
  const paypalApiCredentials = {
    user: "sb-hgqhx35170711_api1.business.example.com",
    pwd: "HFPNWBZNDVR2LJBC",
    signature: "AzAibTQIex06ji3rlT3Oro9cEqYkAhUdchXKZJFJS9gAssHflYQJcVoE",
  };
  try {
    const response = await axios.post(
      `https://sandbox.paypal.com/v2/checkout/orders/${transactionId}/capture`,
      {
        USER: paypalApiCredentials.user,
        PWD: paypalApiCredentials.pwd,
        SIGNATURE: paypalApiCredentials.signature,
        METHOD: "DoExpressCheckoutPayment",
        VERSION: "204",
        // المزيد من البيانات المطلوبة بناءً على العملية التي تريد تنفيذها
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("capturePayment", response.data);
    return response.data;
  } catch (error: any) {
    console.error("PayPal API Error:", error.response?.data || error.message);
  }
};
