import { Product } from 'src/schemas/product.schema';

export class ProductPaginationDto {
  subproducts: Product[];
  total_products: number;
  page: number;
  total_pages: number;
}

export class SearchDto {
  input: string;
  page: number;
}
