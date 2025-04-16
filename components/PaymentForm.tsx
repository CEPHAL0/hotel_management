import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

// Load Stripe
const stripePromise = loadStripe('your_publishable_key');

interface PaymentFormProps {
    bookingId: number;
    amount: number;
    onSuccess: () => void;
    onError: (error: string) => void;
}

const PaymentFormComponent: React.FC<PaymentFormProps> = ({ bookingId, amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        // Create PaymentIntent as soon as the component loads
        const createPaymentIntent = async () => {
            try {
                const response = await axios.post(
                    `/api/payments/${bookingId}/create-payment-intent`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                setClientSecret(response.data.data.clientSecret);
            } catch (error) {
                onError('Failed to initialize payment');
            }
        };

        createPaymentIntent();
    }, [bookingId]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            return;
        }

        setProcessing(true);

        try {
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                    billing_details: {
                        name: 'Customer Name', // You can get this from your user data
                    },
                },
            });

            if (stripeError) {
                onError(stripeError.message || 'Payment failed');
            } else if (paymentIntent.status === 'succeeded') {
                onSuccess();
            }
        } catch (error) {
            onError('An error occurred during payment');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <div className="payment-amount">
                <h3>Total Amount: ${amount}</h3>
            </div>
            
            <div className="card-element-container">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>

            <button 
                type="submit" 
                disabled={!stripe || processing}
                className="pay-button"
            >
                {processing ? 'Processing...' : `Pay $${amount}`}
            </button>
        </form>
    );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
    return (
        <Elements stripe={stripePromise}>
            <PaymentFormComponent {...props} />
        </Elements>
    );
};

export default PaymentForm; 