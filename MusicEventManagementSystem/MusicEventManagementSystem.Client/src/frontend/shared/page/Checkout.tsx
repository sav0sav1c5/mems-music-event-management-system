// Checkout.tsx - Client verzija
import { useState } from "react";
import { CreditCard, User, Lock, Ticket, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { Card } from "../../ticket-sales/components/card";
import { useNavigate } from "react-router-dom";

interface OrderSummary {
  subtotal: number;
  discount: number;
  serviceFee: number;
  total: number;
  items: Array<{
    eventName: string;
    ticketType: string;
    quantity: number;
    price: number;
  }>;
}

const Checkout = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'billing' | 'payment' | 'review' | 'complete'>('billing');
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Serbia'
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    saveCard: false
  });

  // Mock order data
  const orderSummary: OrderSummary = {
    subtotal: 270,
    discount: 27,
    serviceFee: 19.44,
    total: 262.44,
    items: [
      { eventName: "Summer Rock Festival", ticketType: "General Admission", quantity: 2, price: 65 },
      { eventName: "Jazz Night Live", ticketType: "VIP Section", quantity: 1, price: 120 },
      { eventName: "Electronic Beats", ticketType: "Premium Access", quantity: 1, price: 85 }
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStep('complete');
    setLoading(false);
  };

  const isStepValid = (stepName: string) => {
    switch (stepName) {
      case 'billing':
        return billingInfo.firstName && billingInfo.lastName && billingInfo.email && billingInfo.phone;
      case 'payment':
        return paymentInfo.cardNumber && paymentInfo.expiryDate && paymentInfo.cvv && paymentInfo.cardholderName;
      default:
        return true;
    }
  };

  if (step === 'complete') {
    return (
      <div className="text-white h-full flex flex-col p-2">
        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
          <Card className="p-12 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Order Complete!</h1>
            <p className="text-neutral-400 mb-6 text-lg">
              Thank you for your purchase. Your tickets have been sent to your email.
            </p>
            <div className="bg-neutral-800/30 rounded-xl p-6 mb-8">
              <p className="text-white mb-2">Order #: <span className="text-orange-400 font-medium">MEV-2024-001234</span></p>
              <p className="text-neutral-400 text-sm">Total: <span className="text-white font-medium">${orderSummary.total.toFixed(2)}</span></p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate("/client/orders")}
                className="flex-1 bg-orange-400 hover:bg-orange-500 text-black py-3 rounded-xl transition-all duration-200 font-medium"
              >
                View My Tickets
              </button>
              <button 
                onClick={() => navigate("/client/events")}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl transition-all duration-200"
              >
                Browse More Events
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
      <div className="text-white h-full flex flex-col p-4 m-1">
        {/* Header */}
        <div>
          <div className="mb-4"> 
            <h1 className="text-2xl font-bold text-white mb-1">Secure Checkout</h1>
            <p className="text-neutral-400 text-sm">Complete your ticket purchase</p>
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="p-6 mb-6">
          <div className="flex items-center max-w-2xl mx-auto">
            {['billing', 'payment', 'review'].map((stepName, index) => (
              <div key={stepName} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  step === stepName 
                    ? 'bg-orange-400 text-black' 
                    : isStepValid(stepName) || ['payment', 'review'].includes(step)
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {isStepValid(stepName) && step !== stepName ? '✓' : index + 1}
                </div>
                <div className="flex-1 mx-4">
                  <div className={`h-1 rounded-full transition-all duration-200 ${
                    isStepValid(stepName) || ['payment', 'review'].includes(step)
                      ? 'bg-orange-400'
                      : 'bg-neutral-800'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Billing Information */}
              {step === 'billing' && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="w-6 h-6 text-orange-400" />
                    <h2 className="text-xl font-semibold text-white">Billing Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-neutral-300 mb-2">First Name *</label>
                      <input
                        type="text"
                        value={billingInfo.firstName}
                        onChange={(e) => setBillingInfo({...billingInfo, firstName: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-300 mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={billingInfo.lastName}
                        onChange={(e) => setBillingInfo({...billingInfo, lastName: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-300 mb-2">Email *</label>
                      <input
                        type="email"
                        value={billingInfo.email}
                        onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-300 mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={billingInfo.phone}
                        onChange={(e) => setBillingInfo({...billingInfo, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                        required
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* Payment Information */}
              {step === 'payment' && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-orange-400" />
                    <h2 className="text-xl font-semibold text-white">Payment Method</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-neutral-300 mb-2">Card Number *</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-neutral-300 mb-2">Expiry Date *</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-neutral-300 mb-2">CVV *</label>
                        <input
                          type="text"
                          placeholder="123"
                          value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-neutral-300 mb-2">Cardholder Name *</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={paymentInfo.cardholderName}
                        onChange={(e) => setPaymentInfo({...paymentInfo, cardholderName: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                        required
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                {step !== 'billing' && (
                  <button
                    type="button"
                    onClick={() => setStep(step === 'payment' ? 'billing' : 'payment')}
                    className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-all duration-200"
                  >
                    Back
                  </button>
                )}
                
                <button
                  type={step === 'review' ? 'submit' : 'button'}
                  onClick={() => step !== 'review' && setStep(step === 'billing' ? 'payment' : 'review')}
                  disabled={!isStepValid(step)}
                  className="px-6 py-3 bg-orange-400 hover:bg-orange-500 disabled:bg-neutral-700 disabled:text-neutral-400 text-black font-medium rounded-xl transition-all duration-200 ml-auto"
                >
                  {loading ? 'Processing...' : step === 'review' ? 'Complete Purchase' : 'Continue'}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
              
              {/* Tickets */}
              <div className="space-y-4 mb-6">
                {orderSummary.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{item.eventName}</p>
                      <p className="text-neutral-400 text-xs">{item.ticketType} × {item.quantity}</p>
                    </div>
                    <p className="text-orange-400 font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t border-neutral-700 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="text-white">${orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Discount (10%)</span>
                  <span className="text-green-400">-${orderSummary.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Service Fee</span>
                  <span className="text-white">${orderSummary.serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-neutral-700 pt-3">
                  <span className="text-white">Total</span>
                  <span className="text-orange-400">${orderSummary.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-neutral-800/30 rounded-xl border border-neutral-700">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Secure Payment</span>
                </div>
                <p className="text-neutral-400 text-xs">
                  Your payment information is encrypted and secure. We do not store your card details.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;