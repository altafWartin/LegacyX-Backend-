const Media = require("../models/media");
const Collection = require("../models/collection");

const Like = require("../models/likes");
const User = require("../models/user");
const MediaDTO = require("../dto/media");
const validationSchema = require("../validation/validationSchema");
const LikeDto = require("../dto/like");
const CollectionDto = require("../dto/collection");
const stripe = require("../config/stripe");
const { default: mongoose } = require("mongoose");
const { sendMail } = require("../util/email");

// const WEBHOOK_SECRET = "whsec_6s4tijdVn0H1lk7A4CgJsr1XYskRESvM";
const WEBHOOK_SECRET = "whsec_EornGp1j1i20vfP7dZbNhKeaxvigth7l";

const subscriptionController = {
  async create(req, res, next) {
    // const user = req.user;
    // const { error } = validationSchema.createCollection.validate(req.body);
    // if (error) {
    //     return next(error);
    // }

    const { name, price, description, features } = req.body;

    try {
      const stripeProduct = await stripe.products.create({
        name,
        description,
        default_price_data: {
          currency: "gbp",
          unit_amount: Number(price) * 100,
          recurring: {
            interval: "month",
          },
        },
        features,
      });

      return res
        .status(201)
        .json({ message: "Subscription Created Successfully", stripeProduct });
    } catch (error) {
      return next(error);
    }
  },

  async getAll(req, res, next) {
    let subscriptions = await stripe.products.list({
      expand: ["data.default_price"],
    });

    let data = subscriptions.data
      .filter((e) => e.active)
      .map((item) => ({
        productId: item.id,
        priceId: item?.default_price?.id,
        name: item.name,
        description: item.description,
        features: item.features,
        price: item?.default_price?.unit_amount / 100,
        createdAt: item.created,
        currency: item?.default_price?.currency,
      }));

    return res
      .status(201)
      .json({ message: "All Subscriptions", subscriptions: data });
  },

  async subscribe(req, res, next) {
    const user = req.user;
    // const { error } = validationSchema.createCollection.validate(req.body);
    // if (error) {
    //     return next(error);
    // }

    const { id } = req.params;

    let userData = await User.findById(user._id);
    let customer = userData?.stripe_customer_id;

    try {
      const session = await stripe.checkout.sessions.create({
        success_url: "https://starfish-app-j9u6s.ondigitalocean.app/success",
        line_items: [
          {
            price: id,
            quantity: 1,
          },
        ],
        mode: "subscription",
        ...(!customer ? { customer_email: user.email } : {}),
        metadata: {
          user_id: user._id.toString(),
        },
        ...(customer ? { customer } : {}),
      });

      return res.status(201).json({
        message: "Payment Link Generated Successfully",
        data: { url: session.url },
      });
    } catch (error) {
      return next(error);
    }
  },

  async cancelSubscription(req, res, next) {
    const user = req.user;
    // const { error } = validationSchema.createCollection.validate(req.body);
    // if (error) {
    //     return next(error);
    // }

    let userData = await User.findById(user._id);
    let subscriptionId = userData?.subscribed?.[0];

    if (!subscriptionId) {
      throw new Error("No Subscription Exist");
    }

    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);

      sendMail(
        userData.email,
        "We're Sorry to See You Go - Cancellation Confirmation for LXDC Premium",
        `Hi there,\n
We hope this message finds you well. It's with a touch of sadness that we confirm the cancellation of your LXDC Premium subscription. While we respect your decision, we'd love to hear any feedback or suggestions you might have to improve our service.\n
If there's anything we can assist you with during this process or if you have any lingering questions, please reach out to our support team at Info@legacyx.uk\n
Once again, thank you for being a part of LXDC Premium. We wish you all the best!\n
        
Sincerely,
LXDC Team`
      );

      return res.status(201).json({
        message: "Subscription has been cancelled successfully.",
      });
    } catch (error) {
      return next(error);
    }
  },

  async stripeWebhook(req, res, next) {
    let event;
    var payload = req.body;

    try {
      event = await stripe.webhooks.constructEvent(
        payload,
        req.headers["stripe-signature"],
        WEBHOOK_SECRET
      );
    } catch (error) {
      return next(error);
    }

    switch (event.type) {
      case "checkout.session.completed":
        const data = event.data.object;

        let user = await User.findById(data.metadata.user_id);

        user.stripe_customer_id = data.customer;
        user.isSubscribed = true;
        user.subscribed = [...user.subscribed, data.subscription];

        sendMail(
          user.email,
          "Welcome to LXDC Premium – Unlock a World of Exclusive Features!",
          `Thank you for choosing LXDC Premium! 🚀 We're thrilled to welcome you to our exclusive community of power users who are about to experience LXDC in its full glory.\n
  Here's a glimpse of what awaits you:\n
  Ad-Free Experience
  Downloadable Content\n
  If you have any questions, don't hesitate to reach out to our support team at Info@legacyx.uk\n
  Thank you for choosing LXDC Premium. Let's make your LXDC experience extraordinary!\n
          
  Sincerely,\n
  LXDC Team`
        );
        await user.save();

        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        if (
          invoice.billing_reason === "subscription_cancellation" &&
          invoice.subscription
        ) {
          const subscriptionId = invoice.subscription;
          stripe.subscriptions.retrieve(
            subscriptionId,
            async (err, subscription) => {
              if (err) {
                console.error("Error retrieving subscription:", err);
              } else {
                const metadata = subscription.metadata;

                let user = await User.findById(metadata.user_id);

                user.isSubscribed = false;

                sendMail(
                  user.email,
                  "Subscription Expired",
                  "Your subscription has been expired"
                );

                await user.save();
              }
            }
          );
        }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return res.status(200).json({ message: "Success" });
  },

  async getSubscriptionsLogs(req, res, next) {
    const user = req.user;

    try {
      let userData = await User.findById(user._id);

      let data = await getDetailsByCusId(userData?.stripe_customer_id);

      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  },

  async success(req, res, next) {
    try {
      res.send(
        `<html><body><h1>Successfully Subscribed! Please Close the Browser</h1></body></html>`
      );
    } catch (error) {
      return next(error);
    }
  },
};

const getDetailsByCusId = async (customer_id) => {
  let subscribedProducts = null;

  if (customer_id) {
    const subscriptions = await stripe.subscriptions.list({
      customer: customer_id,
    });

    subscribedProducts = await Promise.all(
      subscriptions.data.map(async (subscription) => {
        const product = await stripe.products.retrieve(
          subscription.items.data[0].price.product
        );

        return {
          productId: product.id,
          priceId: product.default_price?.id,
          name: product.name,
          description: product.description,
          features: product.features,
          price: subscription?.plan?.amount / 100,
          subscriptionId: subscription.id,
          currency: subscription?.plan?.currency,
          start: subscription.current_period_start * 1000,
          expire: subscription.current_period_end * 1000,
        };
      })
    );
  }

  return subscribedProducts;
};

module.exports = subscriptionController;
