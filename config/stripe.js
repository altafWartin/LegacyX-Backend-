const STRIPE_TEST_KEY =
  "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";
// const STRIPE_TEST_KEY =
//   "sk_test_51OUOflCt6oP6MkWRVt0bQFbaxCZEDyQsZfd68Ejp11QDKoCKG0ZBUd6lKZNuHLdTgluHcLKxcGXfIKPh0OD3NEBo00KfOBTuJo";

const stripe = require("stripe")(STRIPE_TEST_KEY);

module.exports = stripe;
