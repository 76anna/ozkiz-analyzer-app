export interface OzkizProduct {
  product_name: string;
  source_url: string;
  price_original: number;
  price_sale: number | null;
  discount_rate: number;
  category: string;
  colors: string[];
  material: string;
  size_options: string[];
  age_range: string;
  image_thumbnail: string;
  image_urls: string[];
  description?: string;
  scraped_at?: string;
}