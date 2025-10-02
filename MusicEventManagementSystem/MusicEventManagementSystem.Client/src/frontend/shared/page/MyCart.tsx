import { useState } from "react";
import { Trash2, Plus, Minus, ShoppingCart, Calendar, MapPin, Ticket, CreditCard, AlertCircle, ArrowLeft } from "lucide-react";
import { Card } from "../../ticket-sales/components/card";
import { useNavigate } from "react-router-dom";

interface CartItem {
  id: number;
  eventName: string;
  eventDate: string;
  venue: string;
  ticketType: string;
  price: number;
  quantity: number;
  maxQuantity: number;
}

const MyCart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      eventName: "Summer Rock Festival",
      eventDate: "2024-07-15 20:00",
      venue: "Belgrade Arena",
      ticketType: "General Admission",
      price: 65,
      quantity: 2,
      maxQuantity: 8
    },
    {
      id: 2,
      eventName: "Jazz Night Live",
      eventDate: "2024-06-20 19:30",
      venue: "Novi Sad Music Hall",
      ticketType: "VIP Section",
      price: 120,
      quantity: 1,
      maxQuantity: 4
    },
    {
      id: 3,
      eventName: "Electronic Beats",
      eventDate: "2024-08-03 22:00",
      venue: "Exit Festival Stage",
      ticketType: "Premium Access",
      price: 85,
      quantity: 1,
      maxQuantity: 6
    }
  ]);

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const updateQuantity = (itemId: number, newQuantity: number) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === itemId) {
          const quantity = Math.max(0, Math.min(newQuantity, item.maxQuantity));
          return { ...item, quantity };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (itemId: number) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const applyPromoCode = () => {
    const validPromoCodes: Record<string, number> = {
      "SAVE10": 10,
      "STUDENT": 15,
      "EARLY20": 20,
      "VIP25": 25
    };

    if (validPromoCodes[promoCode.toUpperCase()]) {
      setAppliedPromo(promoCode.toUpperCase());
      setPromoDiscount(validPromoCodes[promoCode.toUpperCase()]);
      setPromoCode("");
    } else {
      alert("Invalid promo code");
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoDiscount(0);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * promoDiscount) / 100;
  const serviceFee = subtotal > 0 ? Math.max(subtotal * 0.08, 5) : 0;
  const total = subtotal - discountAmount + serviceFee;

  const handleCheckout = () => {
    navigate("/client/checkout");
  };

  return (
    <div className="text-white h-full flex flex-col p-2">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200"
            >
              <ArrowLeft size={20} className="text-neutral-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Shopping Cart</h1>
              <p className="text-neutral-400 text-sm">Review your selected tickets</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            {<ShoppingCart size={20} />}
            <span>{cartItems.length} items</span>
          </div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        /* Empty Cart */
        <Card className="text-center py-16">
          <div className="p-4 bg-neutral-800/50 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-400 text-base mb-2">Your cart is empty</p>
          <p className="text-neutral-500 text-sm mb-6">Browse events and add tickets to get started</p>
          <button className="bg-orange-500 hover:bg-orange-600 text-black px-6 py-3 rounded-xl transition-all duration-200">
            Browse Events
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} hover={true} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg text-white font-medium mb-1">{item.eventName}</h3>
                    <div className="space-y-1 text-sm text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-400" />
                        <span>{formatDateTime(item.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-400" />
                        <span>{item.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-orange-400" />
                        <span>{item.ticketType}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-400 text-sm">Quantity:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-all duration-200"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-all duration-200"
                        disabled={item.quantity >= item.maxQuantity}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-xs text-neutral-500">Max: {item.maxQuantity}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 text-lg font-medium">${(item.price * item.quantity).toLocaleString()}</p>
                    <p className="text-neutral-400 text-xs">${item.price} each</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl text-white font-semibold mb-4">Order Summary</h2>
              
              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm text-neutral-300 mb-2">Promo Code</label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <div>
                      <span className="text-green-400 text-sm font-medium">{appliedPromo}</span>
                      <p className="text-green-300 text-xs">{promoDiscount}% discount applied</p>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-green-400 hover:text-green-300 transition-colors"
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
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
                    />
                    <button
                      onClick={applyPromoCode}
                      disabled={!promoCode.trim()}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-black disabled:text-neutral-400 rounded-xl transition-all duration-200 font-medium"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="text-white">${subtotal.toLocaleString()}</span>
                </div>
                
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Discount ({promoDiscount}%)</span>
                    <span className="text-green-400">-${discountAmount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Service Fee</span>
                  <span className="text-white">${serviceFee.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-neutral-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-orange-400 text-xl font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
                  <div>
                    <p className="text-orange-400 text-sm font-medium">Important</p>
                    <p className="text-orange-300 text-xs mt-1">
                      Tickets are held for 15 minutes. Complete your purchase to secure your tickets.
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button 
                onClick={handleCheckout}
                className="w-full bg-orange-500 hover:bg-orange-600 text-black py-4 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 font-semibold"
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
  );
};

export default MyCart;