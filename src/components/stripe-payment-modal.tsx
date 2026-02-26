'use client'

import { createStripePaymentIntent } from '@/actions/payments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ''

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

type PaymentFormProps = {
  clientSecret: string
  amount: number
  isBookingRoom: boolean
  onCancel: () => void
  onPaymentSuccess: (paymentId: string) => Promise<void>
}

function PaymentForm({
  clientSecret,
  amount,
  isBookingRoom,
  onCancel,
  onPaymentSuccess,
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '24px',
        color: '#111827',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#dc2626',
      },
    },
  }

  const handleSubmitPayment = async () => {
    if (!stripe || !elements) {
      return
    }

    const cardNumberElement = elements.getElement(CardNumberElement)

    if (!cardNumberElement) {
      toast.error('Card details are required')
      return
    }

    try {
      setIsSubmittingPayment(true)
      const response = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: fullName || undefined,
            address: {
              line1: address || undefined,
            },
          },
        },
      })

      if (response.error) {
        throw new Error(response.error.message || 'Payment failed')
      }

      if (!response.paymentIntent || response.paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not completed')
      }

      await onPaymentSuccess(response.paymentIntent.id)
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payment')
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  return (
    <div className='space-y-4'>
      <div>
        <p className='mb-2 text-2xl text-foreground'>Card number</p>
        <div className='h-12 rounded-md border border-input px-3 py-3'>
          <CardNumberElement options={cardElementOptions} />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div>
          <p className='mb-2 text-2xl text-foreground'>Expiry (MM/YY)</p>
          <div className='h-12 rounded-md border border-input px-3 py-3'>
            <CardExpiryElement options={cardElementOptions} />
          </div>
        </div>

        <div>
          <p className='mb-2 text-2xl text-foreground'>Security code</p>
          <div className='h-12 rounded-md border border-input px-3 py-3'>
            <CardCvcElement options={cardElementOptions} />
          </div>
        </div>
      </div>

      <div>
        <p className='mb-2 text-2xl text-foreground'>Full name</p>
        <Input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className='h-12 text-xl'
          placeholder='Enter full name'
        />
      </div>

      <div>
        <p className='mb-2 text-2xl text-foreground'>Address</p>
        <Input
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          className='h-12 text-xl'
          placeholder='Enter address'
        />
      </div>

      <DialogFooter>
        <Button type='button' variant='outline' onClick={onCancel} disabled={isSubmittingPayment || isBookingRoom}>
          Cancel
        </Button>
        <Button
          type='button'
          onClick={handleSubmitPayment}
          disabled={!stripe || !elements || isSubmittingPayment || isBookingRoom}
        >
          {isSubmittingPayment || isBookingRoom ? 'Processing...' : `Pay $${Number(amount || 0)}`}
        </Button>
      </DialogFooter>
    </div>
  )
}

type StripePaymentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  currency?: string
  isBookingRoom?: boolean
  onPaymentSuccess: (paymentId: string) => Promise<void>
}

function StripePaymentModal({
  open,
  onOpenChange,
  amount,
  currency = 'usd',
  isBookingRoom = false,
  onPaymentSuccess,
}: StripePaymentModalProps) {
  const [clientSecret, setClientSecret] = useState('')
  const [isLoadingIntent, setIsLoadingIntent] = useState(false)

  const canInitializePayment = useMemo(() => {
    return Boolean(open && amount > 0)
  }, [open, amount])

  useEffect(() => {
    const initPaymentIntent = async () => {
      if (!canInitializePayment) {
        return
      }

      if (!stripePromise) {
        toast.error('Stripe public key is not configured')
        return
      }

      try {
        setIsLoadingIntent(true)
        setClientSecret('')

        const response = await createStripePaymentIntent(amount, currency)

        if (!response.success || !response.clientSecret) {
          throw new Error(response.message || 'Failed to initialize payment')
        }

        setClientSecret(response.clientSecret)
      } catch (error: any) {
        toast.error(error.message || 'Failed to initialize payment')
      } finally {
        setIsLoadingIntent(false)
      }
    }

    initPaymentIntent()
  }, [amount, canInitializePayment, currency])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='min-w-125 max-h-screen overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-center text-4xl'>Complete Payment</DialogTitle>
          <DialogDescription>
            <span className='block text-center text-3xl'>Total Amount: ${Number(amount || 0)}</span>
          </DialogDescription>
        </DialogHeader>

        {isLoadingIntent ? (
          <p className='text-sm text-muted-foreground'>Preparing payment...</p>
        ) : !stripePromise ? (
          <p className='text-sm text-red-600'>Stripe public key is not configured.</p>
        ) : clientSecret ? (
          <Elements options={{ clientSecret }} stripe={stripePromise}>
            <PaymentForm
              clientSecret={clientSecret}
              amount={amount}
              isBookingRoom={isBookingRoom}
              onCancel={() => onOpenChange(false)}
              onPaymentSuccess={onPaymentSuccess}
            />
          </Elements>
        ) : (
          <p className='text-sm text-red-600'>Unable to initialize payment. Please try again.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default StripePaymentModal
