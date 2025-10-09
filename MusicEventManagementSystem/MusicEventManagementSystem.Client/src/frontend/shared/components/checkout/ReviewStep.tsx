import { Card } from "../../../ticket-sales/components/ui/card";
import { Shield } from "lucide-react";
import { PaymentMethod } from "../../../ticket-sales/types/enums/TicketSales";

interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  paymentMethod: PaymentMethod;
}

interface ReviewStepProps {
  billingInfo: BillingInfo;
  paymentInfo: PaymentInfo;
}

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

export const ReviewStep = ({ billingInfo, paymentInfo }: ReviewStepProps) => {
  return (
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
  );
};