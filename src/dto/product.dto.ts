import { SubproductDto } from "./subproduct.dto"

export class ProductDto {
  name: string
  category: string
  isActive: boolean
  highlight: boolean
  description: string
  images: Array<string>
  brand: string
}