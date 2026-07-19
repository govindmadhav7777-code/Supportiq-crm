type Props = {
  className?: string;
};

/**
 * The signature mark: a funnel shape, since that's literally what a
 * sales pipeline is. Used in the nav logo and empty states instead
 * of a generic geometric monogram — it's a small detail, but it ties
 * the visual identity to the actual subject matter of the product.
 */
export default function FunnelMark({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 4h18l-6.5 8.5v6l-5 2v-8L3 4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
