import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectId, Document, Types } from "mongoose";
import { AnimalAgeDto, AnimalDto, AnimalSizeDto, BrandDto, CategoryDto } from "../dto/types.dto";

@Schema()
export class Subproduct extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Product' })
  product: ObjectId;

  @Prop({ required: false })
  buy_price: number;

  @Prop({ required: false })
  sell_price: number;

  @Prop({ required: false })
  size: number;

  @Prop({ required: false })
  category: CategoryDto;

  @Prop({ required: false })
  animal: AnimalDto;

  @Prop({ required: false })
  brand: BrandDto;

  @Prop({ required: false })
  animal_size: AnimalSizeDto;

  @Prop({ required: false })
  animal_age: AnimalAgeDto;

  @Prop({ required: false })
  active: boolean;

  @Prop({ required: false })
  stock: number;

  @Prop({ required: false })
  highlight: boolean;
}

export const SubproductSchema = SchemaFactory.createForClass(Subproduct)