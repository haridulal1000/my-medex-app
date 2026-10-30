import { formatMoney } from '@domain/money';
import type { PriceResult } from '@domain/pricing';

export function MoneyLabel({
  price,
  currency,
  prefix,
}: {
  price: PriceResult;
  currency: string;
  prefix?: string;
}) {
  const discounted = price.finalPrice < price.originalPrice;
  return (
    <div className="flex items-baseline gap-2 justify-end">
      {prefix && <span className="text-xs text-slate-500">{prefix}</span>}
      <span className="font-semibold text-slate-900">
        {formatMoney(price.finalPrice, currency)}
      </span>
      {discounted && (
        <span className="text-xs text-slate-400 line-through">
          {formatMoney(price.originalPrice, currency)}
        </span>
      )}
    </div>
  );
}