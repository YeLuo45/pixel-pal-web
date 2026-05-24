/**
 * MyCard.tsx — MUI Card replacement
 * 
 * Replaces MUI Card component with custom styling.
 * Supports: children, variant, elevation, outlined
 */

import { type FC, type ReactNode, type CSSProperties } from 'react';

export interface MyCardProps {
  children?: ReactNode;
  variant?: 'elevation' | 'outlined';
  elevation?: number;
  outlined?: boolean;
  className?: string;
  sx?: CSSProperties;
  onClick?: () => void;
  style?: CSSProperties;
}

export const MyCard: FC<MyCardProps> = ({
  children,
  variant = 'elevation',
  elevation = 1,
  outlined = false,
  className = '',
  sx = {},
  onClick,
  style = {},
}) => {
  const getShadow = (level: number): string => {
    const shadows = [
      'none',
      '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
      '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
      '0 10px 15px rgba(0, 0, 0, 0.07), 0 4px 6px rgba(0, 0, 0, 0.05)',
      '0 20px 25px rgba(0, 0, 0, 0.08), 0 10px 10px rgba(0, 0, 0, 0.04)',
      '0 25px 50px rgba(0, 0, 0, 0.15)',
    ];
    return shadows[Math.min(level, shadows.length - 1)] || shadows[1];
  };

  const baseStyle: CSSProperties = {
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    padding: '20px',
    transition: 'all 0.2s ease',
    cursor: onClick ? 'pointer' : 'default',
    ...(variant === 'outlined' || outlined
      ? {
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'none',
        }
      : {
          boxShadow: getShadow(elevation),
        }),
    ...sx,
    ...style,
  };

  return (
    <div
      className={className}
      style={baseStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};


// MyCardContent - content wrapper for MyCard
export interface MyCardContentProps {
  children: React.ReactNode;
  sx?: object;
  className?: string;
}

export const MyCardContent: FC<MyCardContentProps> = ({ children, sx, className = '' }) => {
  return (
    <div className={className} style={{ padding: '0 16px 16px', ...sx }}>
      {children}
    </div>
  );
};

export default MyCard;
