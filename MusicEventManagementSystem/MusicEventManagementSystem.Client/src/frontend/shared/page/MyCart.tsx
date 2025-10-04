import { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingCart, Ticket, CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "../../ticket-sales/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CartService } from "../../shared/services/client/cartService";
import type { CartDto, CartItemDto, UpdateCartItemDto } from "../../shared/types/api/cart";

const MyCart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [applyingPromo, setApplyingPromo] = useState(false);

  // Mock user ID - replace with actual user ID from auth context
  const userId = "user123";

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartData = await CartService.getCart(userId);
      setCart(cartData);
    } catch (error) {
      console.error("Error fetching cart:", error);
      // Fallback to empty cart if API fails
      setCart({
        items: [],
        subtotal: 0,
        totalDiscount: 0,
        total: 0,
        totalItems: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (ticketTypeId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(ticketTypeId);
      const updateDto: UpdateCartItemDto = {
        ticketTypeId,
        quantity: newQuantity
      };
      
      const updatedCart = await CartService.updateCartItem(userId, updateDto);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error updating cart item:", error);
      // Refresh cart to get current state
      await fetchCart();
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (ticketTypeId: number) => {
    try {
      setUpdating(ticketTypeId);
      const updatedCart = await CartService.removeFromCart(userId, ticketTypeId);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error removing item from cart:", error);
      await fetchCart();
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    if (!confirm("Are you sure you want to clear your entire cart?")) return;
    
    try {
      await CartService.clearCart(userId);
      setCart({
        items: [],
        subtotal: 0,
        totalDiscount: 0,
        total: 0,
        totalItems: 0
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
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
    navigate("/client/checkout");
  };

  useEffect(() => {
    fetchCart();
  }, []);

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Shopping Cart</h1>
              <p className="text-neutral-400 text-sm">Loading your cart...</p>
            </div>
          </div>
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Shopping Cart</h1>
            <p className="text-neutral-400 text-sm">Review your selected tickets</p>
          </div>
          <div className="flex items-center gap-2 text-neutral-400 bg-neutral-800/50 px-4 py-2 rounded-xl">
            <ShoppingCart size={20} />
            <span className="font-medium">{cart?.totalItems || 0} items</span>
          </div>
        </div>

        {!cart?.items || cart.items.length === 0 ? (
          /* Empty Cart */
          <Card className="text-center py-16">
            <div className="p-4 bg-neutral-800/50 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-400 text-base mb-2">Your cart is empty</p>
            <p className="text-neutral-500 text-sm mb-6">Browse events and add tickets to get started</p>
            <button 
              onClick={() => navigate("/client/events")}
              className="px-6 py-3 rounded-xl bg-orange-400 text-black font-medium hover:bg-orange-500 transition-all duration-200 shadow-lg"
            >
              Browse Events
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Cart Items</h2>
                <button
                  onClick={clearCart}
                  className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm"
                >
                  <Trash2 size={16} />
                  Clear Entire Cart
                </button>
              </div>
              
              {cart.items.map((item: CartItemDto) => (
                <Card key={item.ticketTypeId} hover={true} className="p-6 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-400/20 rounded-lg border border-orange-500/30">
                          <Ticket className="w-5 h-5 text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white text-lg font-medium group-hover:text-orange-400 transition-colors">
                            {item.eventName}
                          </h3>
                          <div className="space-y-1 text-sm text-neutral-400 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-orange-400">Ticket:</span>
                              <span>{item.ticketTypeName}</span>
                            </div>
                            {item.zoneName && (
                              <div className="flex items-center gap-2">
                                <span className="text-neutral-500">Zone:</span>
                                <span>{item.zoneName}</span>
                              </div>
                            )}
                            {item.specialOfferName && (
                              <div className="flex items-center gap-2 text-green-400">
                                <span>✓ Special Offer: {item.specialOfferName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.ticketTypeId)}
                      disabled={updating === item.ticketTypeId}
                      className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                    <div className="flex items-center gap-3">
                      <span className="text-neutral-400 text-sm">Quantity:</span>
                      <div className="flex items-center gap-2 bg-neutral-800 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.ticketTypeId, item.quantity - 1)}
                          disabled={updating === item.ticketTypeId || item.quantity <= 1}
                          className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-400 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-white font-medium text-sm">
                          {updating === item.ticketTypeId ? (
                            <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.ticketTypeId, item.quantity + 1)}
                          disabled={updating === item.ticketTypeId}
                          className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-400 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-400 text-lg font-bold">
                        {formatCurrency(item.subtotal)}
                      </p>
                      <p className="text-neutral-400 text-xs">
                        {formatCurrency(item.unitPrice)} each
                        {item.discountAmount > 0 && (
                          <span className="text-green-400 ml-1">
                            (Save {formatCurrency(item.discountAmount * item.quantity)})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
                
                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Promo Code</label>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div>
                        <span className="text-green-400 text-sm font-medium">{appliedPromo}</span>
                        <p className="text-green-300 text-xs">{promoDiscount}% discount applied</p>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="text-green-400 hover:text-green-300 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                        placeholder="Enter promo code"
                        className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      />
                      <button
                        onClick={applyPromoCode}
                        disabled={!promoCode.trim() || applyingPromo}
                        className="px-4 py-2 bg-orange-400 hover:bg-orange-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-black disabled:text-neutral-400 rounded-xl transition-all duration-200 font-medium text-sm flex items-center gap-2"
                      >
                        {applyingPromo ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Subtotal</span>
                    <span className="text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Cart Discounts</span>
                      <span className="text-green-400">-{formatCurrency(cartDiscount)}</span>
                    </div>
                  )}
                  
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Promo Discount ({promoDiscount}%)</span>
                      <span className="text-green-400">-{formatCurrency(promoDiscountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Service Fee</span>
                    <span className="text-white">{formatCurrency(serviceFee)}</span>
                  </div>
                  
                  <div className="border-t border-neutral-700 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-orange-400 text-xl font-bold">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-orange-400 text-sm font-medium">Important Notice</p>
                      <p className="text-orange-300 text-xs mt-1">
                        Tickets are held for 15 minutes. Complete your purchase to secure your tickets.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-orange-400 hover:bg-orange-500 text-black py-4 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 font-semibold text-lg"
                >
                  <CreditCard size={20} />
                  Proceed to Checkout
                </button>

                {/* Security Notice */}
                <p className="text-neutral-500 text-xs mt-4 text-center">
                  🔒 Secure checkout powered by 256-bit SSL encryption
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCart;