interface OrdersHeaderProps {
  title: string;
  subtitle: string;
}

export const OrdersHeader = ({ title, subtitle }: OrdersHeaderProps) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
      <p className="text-neutral-400 text-sm">{subtitle}</p>
    </div>
  );
};