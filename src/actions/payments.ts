'use server'

import Stripe from 'stripe'

const getStripeSecretKey = () => {
  return (
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECURE_KEY ||
    process.env.SECRET_KEY ||
    ''
  )
}

export const createStripePaymentIntent = async (
  amount: number,
  currency = 'usd'
) => {
  try {
    const secretKey = getStripeSecretKey()

    if (!secretKey) {
      throw new Error('Stripe secret key is not configured')
    }

    const stripe = new Stripe(secretKey)

    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new Error('Invalid payment amount')
    }

    const amountInSmallestUnit = Math.round(Number(amount) * 100)

    if (amountInSmallestUnit <= 0) {
      throw new Error('Invalid payment amount')
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    if (!paymentIntent.client_secret) {
      throw new Error('Failed to create Stripe payment intent')
    }

    return {
      success: true,
      message: 'Payment intent created successfully',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to create Stripe payment intent',
      clientSecret: null,
      paymentIntentId: null,
    }
  }
}
