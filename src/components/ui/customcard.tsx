import React from 'react';

type CardProps = {
  imageSrc: string;
  product: string;
  subtitle: string;
  oldPrice: number;
  vipPrice: number;
  salePrice: number;
  discountPercent: number;
  rating: number;
  ratingCount: number;
  colors: string[];
};

export const ProductCard: React.FC<CardProps> = ({
  imageSrc,
  product,
  subtitle,
  oldPrice,
  vipPrice,
  salePrice,
  discountPercent,
  rating,
  ratingCount,
  colors,
}) => {
  return (
    <div style={{
      maxWidth: '380px',
      fontFamily: 'Maharlika, sans-serif',
      background: '#fff',
      borderRadius: '0px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <img src={imageSrc} alt={product} style={{ width: '100%', height: 'auto' }} />
      <div style={{ padding: '18px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '6px' }}>{product}</div>
        <div style={{ color: '#888', fontSize: '15px', marginBottom: '4px' }}>{subtitle}</div>
        <div style={{ color: '#b12704', fontWeight: 600, fontSize: '22px' }}>
          INR {vipPrice.toLocaleString()} <span style={{ color: '#666', fontWeight: 400, fontSize: '16px' }}>({discountPercent}% off)</span>
        </div>
        <div style={{ color: '#737373', fontSize: '15px', marginBottom: '12px' }}>VIP applied</div>
        <div style={{ fontSize: '15px', color: '#222', marginBottom: '8px' }}>
          Sale INR {salePrice.toLocaleString()} <span style={{ textDecoration: 'line-through', color: '#828282', fontSize: '14px', marginLeft: '3px' }}>INR {oldPrice.toLocaleString()}</span>
        </div>
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
          {'★'.repeat(Math.floor(rating))}
          {'☆'.repeat(5 - Math.floor(rating))}
          <span style={{ marginLeft: '7px', color: '#888', fontSize: '14px' }}>({ratingCount})</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {colors.map((color, idx) =>
            <span key={idx} style={{
              display: 'inline-block',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '2px solid #ddd',
              background: color,
              cursor: 'pointer'
            }} />
          )}
        </div>
      </div>
    </div>
  );
};

