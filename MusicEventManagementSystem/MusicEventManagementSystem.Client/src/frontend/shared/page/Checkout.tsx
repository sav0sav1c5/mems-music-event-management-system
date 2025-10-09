import { useState, useEffect } from "react";
import { CreditCard, User, Lock, CheckCircle, ArrowLeft, Loader2, Shield, MapPin } from "lucide-react";
import { Card } from "../../ticket-sales/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CartService } from "../../shared/services/client/cartService";
import { OrdersService } from "../../shared/services/client/ordersService";
import type { CartDto } from "../../shared/types/api/cart";
import type { CheckoutRequestDto } from "../../shared/types/api/checkout";
import { PaymentMethod } from "../../ticket-sales/types/enums/TicketSales";
import { useAuth } from "../contexts/AuthContext";

const getPaymentMethodName = (method: PaymentMethod): string => {
  switch (method) {
    case PaymentMethod.CreditCard: return 'Credit Card';
    case PaymentMethod.DebitCard: return 'Debit Card';
    case PaymentMethod.PayPal: return 'PayPal';
    case PaymentMethod.BankTransfer: return 'Bank Transfer';
    case PaymentMethod.Cash: return 'Cash';
    case PaymentMethod.ApplePay: return 'Apple Pay';
    case PaymentMethod.GooglePay: return 'Google Pay';
    case PaymentMethod.Cryptocurrency: return 'Cryptocurrency';
    default: return 'Credit Card';
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [step, setStep] = useState<'billing' | 'payment' | 'review' | 'complete'>('billing');
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<CartDto | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Form data (samo za UI - ne šalje se backend-u)
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

  const [paymentInfo, setPaymentInfo] = useState<{
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    paymentMethod: PaymentMethod;
  }>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    paymentMethod: PaymentMethod.CreditCard
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const cartData = await CartService.getCart(userId);
      setCart(cartData);
      
      // DODAJTE PROVERU
      if (!cartData.items || cartData.items.length === 0) {
        console.log('🛒 Cart is empty, redirecting to cart page');
        navigate("/client/cart");
        return;
      }
      
    } catch (error) {
      console.error("Error fetching cart:", error);
      navigate("/client/cart");
    } finally {
      setCartLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🛒 Cart items before checkout:', cart?.items);
      
      // OVO JE KLJUČNO - morate dodati cartItems
      const checkoutRequest: CheckoutRequestDto = {
        applicationUserId: userId,
        paymentMethod: paymentInfo.paymentMethod,
        promoCode: undefined,
        cartItems: cart?.items || [] // DODAJTE OVO
      };

      console.log('📦 Checkout request payload:', JSON.stringify(checkoutRequest, null, 2));
      console.log('🎫 Sending cart items:', checkoutRequest.cartItems.length);

      // Proverite da li cartItems nije prazan
      if (!checkoutRequest.cartItems || checkoutRequest.cartItems.length === 0) {
        throw new Error("Cart is empty - cannot proceed with checkout");
      }

      const response = await OrdersService.checkout(userId, checkoutRequest);
      console.log('✅ Checkout successful:', response);
      
      setOrderId(response.orderId);
      setStep('complete');
      
      await CartService.clearCart(userId);
      
    } catch (error: any) {
      console.error("❌ Error processing checkout:", error);
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data || "Invalid request";
        console.error('🔍 Error details:', errorMessage);
        
        if (typeof errorMessage === 'string' && 
            (errorMessage.includes('ticket') || errorMessage.includes('available') || errorMessage.includes('Cart'))) {
          alert("Some tickets in your cart are no longer available. Please review your cart and try again.");
          await fetchCart(); // Osvežite korpu
        } else {
          alert(`Error: ${errorMessage}`);
        }
      } else if (error.message.includes("Cart is empty")) {
        alert("Your cart is empty. Please add tickets before checkout.");
        navigate("/client/cart");
      } else {
        alert("Failed to process your order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (stepName: string) => {
    switch (stepName) {
      case 'billing':
        return billingInfo.firstName && billingInfo.lastName && billingInfo.email && billingInfo.phone;
      case 'payment':
        return paymentInfo.cardNumber.replace(/\s/g, '').length === 16 && 
               paymentInfo.expiryDate && 
               paymentInfo.cvv.length >= 3 && 
               paymentInfo.cardholderName;
      default:
        return true;
    }
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const subtotal = cart?.subtotal || 0;
  const discount = cart?.totalDiscount || 0;
  const serviceFee = subtotal > 0 ? Math.max((subtotal - discount) * 0.08, 5) : 0;
  const total = subtotal - discount + serviceFee;

  if (step === 'complete') {
    return (
      <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
        <div className="text-white h-full flex flex-col p-4 m-1">
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
            <Card className="p-12 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Order Complete!</h1>
              <p className="text-neutral-400 mb-6 text-base">
                Thank you for your purchase. Your tickets have been sent to your email.
              </p>
              <div className="bg-neutral-800/30 rounded-xl p-6 mb-8 border border-neutral-700">
                <p className="text-white mb-2 text-lg">
                  Order #: <span className="text-orange-400 font-bold">
                    {orderId ? `ORD-${String(orderId).padStart(8, '0')}` : 'Processing...'}
                  </span>
                </p>
                <p className="text-neutral-400">
                  Total: <span className="text-white font-medium text-lg">{formatCurrency(total)}</span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate("/client/orders")}
                  className="flex-1 bg-orange-400 hover:bg-orange-500 text-black py-3 rounded-xl transition-all duration-200 font-medium shadow-lg"
                >
                  View My Tickets
                </button>
                <button 
                  onClick={() => navigate("/client/events")}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl transition-all duration-200 border border-neutral-700"
                >
                  Browse More Events
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
        <div className="text-white h-full flex flex-col p-4 m-1">
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
              <p className="text-neutral-400 text-base">Loading checkout...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
      <div className="text-white h-full flex flex-col p-4 m-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/client/cart")}
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors bg-neutral-800/50 hover:bg-neutral-700/50 px-4 py-2 rounded-xl"
            >
              <ArrowLeft size={16} />
              Back to Cart
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Secure Checkout</h1>
              <p className="text-neutral-400 text-sm">Complete your ticket purchase</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-end">
            <div className="flex w-200">
              {[
                { name: 'billing', label: 'Billing', icon: User },
                { name: 'payment', label: 'Payment', icon: CreditCard },
                { name: 'review', label: 'Review', icon: Shield }
              ].map((stepItem, index) => {
                const Icon = stepItem.icon;
                const isCompleted = isStepValid(stepItem.name) && step !== stepItem.name;
                const isCurrent = step === stepItem.name;
                
                return (
                  <div key={stepItem.name} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        isCurrent 
                          ? 'bg-orange-400 text-black shadow-lg' 
                          : isCompleted
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${
                        isCurrent ? 'text-orange-400' : isCompleted ? 'text-green-400' : 'text-neutral-400'
                      }`}>
                        {stepItem.label}
                      </span>
                    </div>
                    {index < 2 && (
                      <div className="flex-1 mx-3">
                        <div className={`h-1 rounded-full transition-all duration-200 ${
                          isCompleted ? 'bg-green-400' : isCurrent ? 'bg-orange-400' : 'bg-neutral-800'
                        }`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Billing Information */}
              {step === 'billing' && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-400/20 rounded-lg border border-orange-500/30">
                      <User className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Billing Information</h2>
                      <p className="text-neutral-400 text-sm">Enter your contact details</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">First Name *</label>
                      <input
                        type="text"
                        value={billingInfo.firstName}
                        onChange={(e) => setBillingInfo({...billingInfo, firstName: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={billingInfo.lastName}
                        onChange={(e) => setBillingInfo({...billingInfo, lastName: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Email *</label>
                      <input
                        type="email"
                        value={billingInfo.email}
                        onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={billingInfo.phone}
                        onChange={(e) => setBillingInfo({...billingInfo, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Address</label>
                      <div className="flex gap-2">
                        <MapPin className="w-5 h-5 text-neutral-500 mt-3 flex-shrink-0" />
                        <input
                          type="text"
                          value={billingInfo.address}
                          onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                          className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">City</label>
                      <input
                        type="text"
                        value={billingInfo.city}
                        onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Postal Code</label>
                      <input
                        type="text"
                        value={billingInfo.postalCode}
                        onChange={(e) => setBillingInfo({...billingInfo, postalCode: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* Payment Information */}
              {step === 'payment' && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-400/20 rounded-lg border border-orange-500/30">
                      <CreditCard className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Payment Method</h2>
                      <p className="text-neutral-400 text-sm">Select payment method and enter card details</p>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-300 mb-3">Payment Method *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: PaymentMethod.CreditCard, label: 'Credit Card' },
                        { value: PaymentMethod.DebitCard, label: 'Debit Card' },
                        { value: PaymentMethod.PayPal, label: 'PayPal' },
                        { value: PaymentMethod.BankTransfer, label: 'Bank Transfer' }
                      ].map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setPaymentInfo({...paymentInfo, paymentMethod: method.value})}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            paymentInfo.paymentMethod === method.value
                              ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                              : 'border-neutral-700 bg-neutral-800/30 text-neutral-300 hover:border-neutral-600'
                          }`}
                        >
                          <span className="font-medium">{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Card Number *</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: formatCardNumber(e.target.value)})}
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                        maxLength={19}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Expiry Date *</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: formatExpiryDate(e.target.value)})}
                          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">CVV *</label>
                        <input
                          type="text"
                          placeholder="123"
                          value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value.replace(/\D/g, '')})}
                          className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Cardholder Name *</label>
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

              {/* Review Step */}
              {step === 'review' && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-400/20 rounded-lg border border-orange-500/30">
                      <Shield className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Review Your Order</h2>
                      <p className="text-neutral-400 text-sm">Confirm your details before payment</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-neutral-300 text-lg font-medium mb-3">Billing Information</h3>
                      <Card className="p-4 bg-neutral-800/30 border border-neutral-700">
                        <div className="space-y-2 text-sm">
                          <p className="text-white font-medium">{billingInfo.firstName} {billingInfo.lastName}</p>
                          <p className="text-neutral-400">{billingInfo.email}</p>
                          <p className="text-neutral-400">{billingInfo.phone}</p>
                          {billingInfo.address && (
                            <p className="text-neutral-400">{billingInfo.address}, {billingInfo.city} {billingInfo.postalCode}</p>
                          )}
                        </div>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-neutral-300 text-lg font-medium mb-3">Payment Method</h3>
                      <Card className="p-4 bg-neutral-800/30 border border-neutral-700">
                        <div className="space-y-2 text-sm">
                          <p className="text-white font-medium">
                            {getPaymentMethodName(paymentInfo.paymentMethod)}
                          </p>
                          {paymentInfo.paymentMethod === PaymentMethod.CreditCard || 
                          paymentInfo.paymentMethod === PaymentMethod.DebitCard ? (
                            <>
                              <p className="text-white font-medium">Card ending in {paymentInfo.cardNumber.slice(-4)}</p>
                              <p className="text-neutral-400">Expires {paymentInfo.expiryDate}</p>
                              <p className="text-neutral-400">{paymentInfo.cardholderName}</p>
                            </>
                          ) : (
                            <p className="text-neutral-400">You will be redirected to complete payment</p>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4 pt-6 border-t border-neutral-800">
                {step !== 'billing' && (
                  <button
                    type="button"
                    onClick={() => setStep(step === 'payment' ? 'billing' : 'payment')}
                    disabled={loading}
                    className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 border border-neutral-700 font-medium"
                  >
                    Back
                  </button>
                )}
                
                <button
                  type={step === 'review' ? 'submit' : 'button'}
                  onClick={() => {
                    if (step !== 'review') {
                      setStep(step === 'billing' ? 'payment' : 'review');
                    }
                  }}
                  disabled={!isStepValid(step) || loading}
                  className="px-8 py-3 bg-orange-400 hover:bg-orange-500 disabled:bg-neutral-700 disabled:text-neutral-400 text-black font-semibold rounded-xl transition-all duration-200 ml-auto disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : step === 'review' ? (
                    'Complete Purchase'
                  ) : (
                    'Continue'
                  )}
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
                {cart?.items.map((item) => (
                  <div key={item.ticketTypeId} className="flex justify-between items-start pb-4 border-b border-neutral-800 last:border-b-0">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{item.eventName}</p>
                      <p className="text-neutral-400 text-xs">
                        {item.ticketTypeName} × {item.quantity}
                      </p>
                      {item.discountAmount > 0 && (
                        <p className="text-green-400 text-xs mt-1">
                          Save {formatCurrency(item.discountAmount * item.quantity)}
                        </p>
                      )}
                    </div>
                    <p className="text-orange-400 font-bold text-lg">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-neutral-700 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="text-white">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Discount</span>
                    <span className="text-green-400">-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Service Fee</span>
                  <span className="text-white">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-neutral-700 pt-3">
                  <span className="text-white">Total</span>
                  <span className="text-orange-400 text-xl">{formatCurrency(total)}</span>
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