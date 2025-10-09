import { Card } from "../../../ticket-sales/components/ui/card";
import { CreditCard } from "lucide-react";
import { PaymentMethod } from "../../../ticket-sales/types/enums/TicketSales";

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  paymentMethod: PaymentMethod;
}

interface PaymentStepProps {
  paymentInfo: PaymentInfo;
  onPaymentInfoChange: (info: PaymentInfo) => void;
}

export const PaymentStep = ({ paymentInfo, onPaymentInfoChange }: PaymentStepProps) => {
  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);
  };

  const handleFieldChange = (field: keyof PaymentInfo, value: string | PaymentMethod) => {
    onPaymentInfoChange({
      ...paymentInfo,
      [field]: value
    });
  };

  const paymentMethods = [
    { value: PaymentMethod.CreditCard, label: 'Credit Card' },
    { value: PaymentMethod.DebitCard, label: 'Debit Card' },
    { value: PaymentMethod.PayPal, label: 'PayPal' },
    { value: PaymentMethod.BankTransfer, label: 'Bank Transfer' }
  ];

  return (
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

      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-300 mb-3">Payment Method *</label>
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => handleFieldChange('paymentMethod', method.value)}
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
            onChange={(e) => handleFieldChange('cardNumber', formatCardNumber(e.target.value))}
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
              onChange={(e) => handleFieldChange('expiryDate', formatExpiryDate(e.target.value))}
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
              onChange={(e) => handleFieldChange('cvv', e.target.value.replace(/\D/g, ''))}
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
            onChange={(e) => handleFieldChange('cardholderName', e.target.value)}
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
            required
          />
        </div>
      </div>
    </Card>
  );
};