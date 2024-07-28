require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const Product = require("../models/product");

const STRIPE_REDIRECT_BASE_URL = process.env.BASE_URL;
// const STRIPE_IMG_BASE_URL = process.env.STRIPE_IMG_BASE_URL;

const checkout = async (req, res) => {
  const { items } = req.body;

  try {
    // const products = await Product.find({
    //   _id: { $in: items.map((item) => item.id) },
    // });

    const lineItems = items.map((product, index) => {
      return {
        price_data: {
          currency: "ron",
          product_data: {
            name: product.title,
            // description: product.description,
            // images: [`${STRIPE_IMG_BASE_URL}/assets/imgs/${items[index].img}`],
          },
          unit_amount: product.price * 100,
          recurring: {
            interval: "month",
          },
        },
        quantity: items[index].quantity,
      };
    });
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      line_items: lineItems,
      mode: "subscription",
      success_url: `${STRIPE_REDIRECT_BASE_URL}/success`,
      cancel_url: `${STRIPE_REDIRECT_BASE_URL}`,
    });
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during checkout." });
  }
};

module.exports = checkout;
