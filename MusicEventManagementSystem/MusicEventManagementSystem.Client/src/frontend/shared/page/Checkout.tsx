import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { CartService } from "../../shared/services/client/cartService";
import { OrdersService } from "../../shared/services/client/ordersService";
import type { CartDto } from "../../shared/types/api/cart";
import type { CheckoutRequestDto } from "../../shared/types/api/checkout";
import { PaymentMethod } from "../../ticket-sales/types/enums/TicketSales";
import { useAuth } from "../contexts/AuthContext";

// Import komponenti
import { CheckoutHeader } from "../components/checkout/CheckoutHeader";
import { CheckoutProgress } from "../components/checkout/CheckoutProgress";
import { BillingStep } from "../components/checkout/BillingStep";
import { PaymentStep } from "../components/checkout/PaymentStep";
import { ReviewStep } from "../components/checkout/ReviewStep";
import { OrderSummary } from "../components/checkout/OrderSummary";
import { CompleteStep } from "../components/checkout/CompleteStep";

const Checkout = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [step, setStep] = useState<'billing' | 'payment' | 'review' | 'complete'>('billing');
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<CartDto | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [orderId, setOrderId] = useState<number | null>(null);

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
    paymentMethod: PaymentMethod.CreditCard as PaymentMethod
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const cartData = await CartService.getCart(userId);
      setCart(cartData);
      
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
      
      const checkoutRequest: CheckoutRequestDto = {
        applicationUserId: userId,
        paymentMethod: paymentInfo.paymentMethod,
        promoCode: undefined,
        cartItems: cart?.items || []
      };

      console.log('📦 Checkout request payload:', JSON.stringify(checkoutRequest, null, 2));

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
          await fetchCart();
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

  const isStepValid = (stepName: string): boolean => {
    switch (stepName) {
      case 'billing':
        return !!(billingInfo.firstName && billingInfo.lastName && billingInfo.email && billingInfo.phone);
      case 'payment':
        return !!(paymentInfo.cardNumber.replace(/\s/g, '').length === 16 && 
               paymentInfo.expiryDate && 
               paymentInfo.cvv.length >= 3 && 
               paymentInfo.cardholderName);
      default:
        return true;
    }
  };

  // Helper funkcija za PaymentStep
  const handlePaymentInfoChange = (info: typeof paymentInfo) => {
    setPaymentInfo(info);
  };

  const subtotal = cart?.subtotal || 0;
  const discount = cart?.totalDiscount || 0;
  const serviceFee = subtotal > 0 ? Math.max((subtotal - discount) * 0.08, 5) : 0;
  const total = subtotal - discount + serviceFee;

  if (step === 'complete') {
    return (
      <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
        <div className="text-white h-full flex flex-col p-4 m-1">
          <CompleteStep orderId={orderId} total={total} />
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
          <CheckoutHeader 
            title="Secure Checkout" 
            subtitle="Complete your ticket purchase" 
          />
          
          {/* Progress Steps */}
          <CheckoutProgress currentStep={step} isStepValid={isStepValid} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Steps */}
              {step === 'billing' && (
                <BillingStep 
                  billingInfo={billingInfo} 
                  onBillingInfoChange={setBillingInfo} 
                />
              )}

              {step === 'payment' && (
                <PaymentStep 
                  paymentInfo={paymentInfo} 
                  onPaymentInfoChange={handlePaymentInfoChange} 
                />
              )}

              {step === 'review' && (
                <ReviewStep 
                  billingInfo={billingInfo} 
                  paymentInfo={paymentInfo} 
                />
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
            <OrderSummary cart={cart} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;