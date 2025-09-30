import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  onClick 
}) => {
  return (
    <div 
      className={`
        bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 
        ${hover ? 'hover:border-neutral-700 transition-all duration-200' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        shadow-lg ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface KpiCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'percentage' | 'value';
  className?: string;
  color?: 'lime' | 'orange' | 'pink' | 'sky' | 'purple'; // Dodajemo color prop
}

export const KpiCard: React.FC<KpiCardProps> = ({
  icon: Icon,
  title,
  value,
  change,
  changeType = 'percentage',
  className = '',
  color = 'lime' // Podrazumevana boja
}) => {
  const isPositive = change !== undefined && change >= 0;
  
  // Definišemo boje za svaki department
  const colorClasses = {
    lime: {
      iconBg: 'bg-lime-400/20',
      iconColor: 'text-lime-400',
      trendColor: isPositive ? 'text-lime-400' : 'text-red-400'
    },
    orange: {
      iconBg: 'bg-orange-400/20',
      iconColor: 'text-orange-400',
      trendColor: isPositive ? 'text-orange-400' : 'text-red-400'
    },
    pink: {
      iconBg: 'bg-pink-400/20',
      iconColor: 'text-pink-400',
      trendColor: isPositive ? 'text-pink-400' : 'text-red-400'
    },
    sky: {
      iconBg: 'bg-sky-400/20',
      iconColor: 'text-sky-400',
      trendColor: isPositive ? 'text-sky-400' : 'text-red-400'
    },
    purple: {
      iconBg: 'bg-purple-400/20',
      iconColor: 'text-purple-400',
      trendColor: isPositive ? 'text-purple-400' : 'text-red-400'
    }
  };

  const colors = colorClasses[color];

  return (
    <Card className={className}>
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${colors.iconBg}`}>
          <Icon className={`${colors.iconColor} w-6 h-6`} />
        </div>
        <div className="flex flex-col items-end">
          <p className="text-neutral-400 text-sm mb-1">{title}</p>
          <p className="text-white text-2xl font-bold mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center text-xs font-medium ${colors.trendColor}`}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {isPositive ? '+' : ''}
              {typeof change === 'number' ? change.toFixed(1) : '0.0'}
              {changeType === 'percentage' ? '%' : ''}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};