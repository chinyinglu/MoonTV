const ImagePlaceholder = ({ aspectRatio }: { aspectRatio: string }) => (
  <div
    className={`skeleton-shimmer w-full rounded-[1rem] ${aspectRatio}`}
    aria-hidden='true'
  />
);

export { ImagePlaceholder };
