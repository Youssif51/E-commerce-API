import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PAYPAL_API = process.env.PAYPAL_API || "https://api.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
  throw new Error("Missing PayPal credentials in environment variables");
}

export const getPayPalToken = async () => {
  const response = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      auth: {
        username: PAYPAL_CLIENT_ID,
        password: PAYPAL_SECRET,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data.access_token;
};

export const PAYPAL_API_URL = PAYPAL_API;
