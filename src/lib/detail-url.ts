export interface DetailLinkParams {
  id?: string;
  title: string;
  poster?: string;
  year?: string;
  rate?: string;
  type?: string;
}

export function buildDetailUrl({
  id,
  title,
  poster,
  year,
  rate,
  type = 'movie',
}: DetailLinkParams): string {
  const params = new URLSearchParams();
  if (id) params.set('id', id);
  params.set('title', title.trim());
  if (poster) params.set('poster', poster);
  if (year) params.set('year', year);
  if (rate) params.set('rate', rate);
  params.set('type', type);
  return `/detail?${params.toString()}`;
}
