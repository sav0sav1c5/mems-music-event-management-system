import { Card } from "../../../ticket-sales/components/ui/card";
import { User, MapPin } from "lucide-react";

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

interface BillingStepProps {
  billingInfo: BillingInfo;
  onBillingInfoChange: (info: BillingInfo) => void;
}

export const BillingStep = ({ billingInfo, onBillingInfoChange }: BillingStepProps) => {
  const handleFieldChange = (field: keyof BillingInfo, value: string) => {
    onBillingInfoChange({
      ...billingInfo,
      [field]: value
    });
  };

  return (
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
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Last Name *</label>
          <input
            type="text"
            value={billingInfo.lastName}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Email *</label>
          <input
            type="email"
            value={billingInfo.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Phone *</label>
          <input
            type="tel"
            value={billingInfo.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
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
              onChange={(e) => handleFieldChange('address', e.target.value)}
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
            onChange={(e) => handleFieldChange('city', e.target.value)}
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Postal Code</label>
          <input
            type="text"
            value={billingInfo.postalCode}
            onChange={(e) => handleFieldChange('postalCode', e.target.value)}
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
          />
        </div>
      </div>
    </Card>
  );
};