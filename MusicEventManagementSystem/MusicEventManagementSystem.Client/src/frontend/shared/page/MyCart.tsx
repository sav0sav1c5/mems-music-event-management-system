import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartService } from "../../shared/services/client/cartService";
import { useAuth } from "../contexts/AuthContext";
import type { CartDto, UpdateCartItemDto } from "../../shared/types/api/cart";

// Components
import CartHeader from "../components/cart/CartHeader";
import CartItems from "../components/cart/CartItems";
import OrderSummary from "../components/cart/OrderSummary";
import EmptyCart from "../components/cart/EmptyCart";

const MyCart = () => {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [, setError] = useState<string | null>(null);
  
  const fetchCart = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const cartData = await CartService.getCart(userId);
      setCart(cartData);
    } catch (error: any) {
      console.error("Error fetching cart:", error);
      
      // Handling specific auth errors
      if (error.response?.status === 403) {
        setError("You are not authorized to access this cart");
      } else if (error.response?.status === 401) {
        setError("Please log in to view your cart");
      } else {
        setError("Failed to load cart. Please try again.");
        // Fallback to empty cart if API fails (except for auth errors)
        setCart({
          items: [],
          subtotal: 0,
          totalDiscount: 0,
          total: 0,
          totalItems: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (ticketTypeId: number, newQuantity: number) => {
    if (newQuantity < 1 || !userId) return;

    try {
      setUpdating(ticketTypeId);
      setError(null);
      const updateDto: UpdateCartItemDto = {
        ticketTypeId,
        quantity: newQuantity
      };
      
      const updatedCart = await CartService.updateCartItem(userId, updateDto);
      setCart(updatedCart);
    } catch (error: any) {
      console.error("Error updating cart item:", error);
      
      if (error.response?.status === 403) {
        setError("You are not authorized to modify this cart");
      } else {
        setError("Failed to update item. Please try again.");
      }
      
      // Refresh cart to get current state
      await fetchCart();
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (ticketTypeId: number) => {
    if (!userId) return;
    
    try {
      setUpdating(ticketTypeId);
      setError(null);
      const updatedCart = await CartService.removeFromCart(userId, ticketTypeId);
      setCart(updatedCart);
    } catch (error: any) {
      console.error("Error removing item from cart:", error);
      
      if (error.response?.status === 403) {
        setError("You are not authorized to modify this cart");
      } else {
        setError("Failed to remove item. Please try again.");
      }
      
      await fetchCart();
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    if (!userId || !confirm("Are you sure you want to clear your entire cart?")) return;
    
    try {
      setError(null);
      await CartService.clearCart(userId);
      setCart({
        items: [],
        subtotal: 0,
        totalDiscount: 0,
        total: 0,
        totalItems: 0
      });
    } catch (error: any) {
      console.error("Error clearing cart:", error);
      
      if (error.response?.status === 403) {
        setError("You are not authorized to clear this cart");
      } else {
        setError("Failed to clear cart. Please try again.");
      }
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;

    try {
      setApplyingPromo(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const validPromoCodes: Record<string, number> = {
        "SAVE10": 10,
        "STUDENT": 15,
        "EARLY20": 20,
        "VIP25": 25
      };

      const upperCode = promoCode.toUpperCase();
      if (validPromoCodes[upperCode]) {
        setAppliedPromo(upperCode);
        setPromoDiscount(validPromoCodes[upperCode]);
        setPromoCode("");
      } else {
        alert("Invalid promo code");
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      alert("Failed to apply promo code");
    } finally {
      setApplyingPromo(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoDiscount(0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleCheckout = () => {
    // Ensure user is authenticated (logged in) before proceeding
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/client/checkout");
  };

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchCart();
    }
  }, [isAuthenticated, userId]);

  // Calculations with promo discount
  const subtotal = cart?.subtotal || 0;
  const cartDiscount = cart?.totalDiscount || 0;
  const subtotalAfterCartDiscount = subtotal - cartDiscount;
  const promoDiscountAmount = (subtotalAfterCartDiscount * promoDiscount) / 100;
  const serviceFee = subtotalAfterCartDiscount > 0 ? Math.max(subtotalAfterCartDiscount * 0.08, 5) : 0;
  const total = subtotalAfterCartDiscount - promoDiscountAmount + serviceFee;

  if (loading) {
    return (
      <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
        <div className="text-white h-full flex flex-col p-4 m-1">
          <CartHeader totalItems={0} />
          <div className="flex items-center justify-center flex-1">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
              <p className="text-neutral-400 text-base">Loading cart items...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
      <div className="text-white h-full flex flex-col p-4 m-1">
        <CartHeader totalItems={cart?.totalItems || 0} />

        {!cart?.items || cart.items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
            {/* Cart Items - Now with proper Card styling */}
            <div className="lg:col-span-2">
              <CartItems
                items={cart.items}
                updating={updating}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onClearCart={clearCart}
                formatCurrency={formatCurrency}
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                subtotal={subtotal}
                cartDiscount={cartDiscount}
                promoDiscount={promoDiscount}
                promoDiscountAmount={promoDiscountAmount}
                serviceFee={serviceFee}
                total={total}
                promoCode={promoCode}
                appliedPromo={appliedPromo}
                applyingPromo={applyingPromo}
                onPromoCodeChange={setPromoCode}
                onApplyPromoCode={applyPromoCode}
                onRemovePromoCode={removePromoCode}
                onCheckout={handleCheckout}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCart;