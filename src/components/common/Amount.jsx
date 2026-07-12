import { formatAmount } from '../../lib/format';

export default function Amount({ value, size = 'md', className = '' }) {
  const sizeStyle = { sm: '14px', md: '16px', lg: '28px' }[size];
  return (
    <span className={className} style={{ fontSize: sizeStyle, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {formatAmount(value)} ₽
    </span>
  );
}
