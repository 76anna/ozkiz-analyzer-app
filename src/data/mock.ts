export interface CompetitorProduct {
  id: number;
  brand: string;
  name: string;
  price: number;
  review_count: number;
  rating: number;
  similarity: number;
  source: string;
}

export const MOCK_COMPETITORS: CompetitorProduct[] = [
  {
    id: 1,
    brand: "모이몰른",
    name: "소녀 플라워 원피스",
    price: 38000,
    review_count: 342,
    rating: 4.7,
    similarity: 81,
    source: "네이버쇼핑",
  },
  {
    id: 2,
    brand: "밀리엄",
    name: "봄꽃 프릴 드레스",
    price: 29900,
    review_count: 128,
    rating: 4.5,
    similarity: 73,
    source: "네이버쇼핑",
  },
  {
    id: 3,
    brand: "이루앤",
    name: "가든 플라워 OPS",
    price: 42000,
    review_count: 89,
    rating: 4.3,
    similarity: 68,
    source: "네이버쇼핑",
  },
  {
    id: 4,
    brand: "블루독",
    name: "플로럴 캉캉 원피스",
    price: 52000,
    review_count: 215,
    rating: 4.8,
    similarity: 62,
    source: "네이버쇼핑",
  },
  {
    id: 5,
    brand: "래핑차일드",
    name: "데이지 프릴 원피스",
    price: 35000,
    review_count: 67,
    rating: 4.2,
    similarity: 58,
    source: "네이버쇼핑",
  },
];