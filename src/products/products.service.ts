import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { Subproduct } from '../schemas/subprod.schema';
import { FilterDto } from 'src/dto/filter.dto';
import { ProductPaginationDto } from 'src/dto/productPagination.dto';
import { Lock } from 'src/schemas/lock.schema';
import { LandingType } from 'src/dto/types.dto';
import { Landing } from 'src/schemas/landing.schema';
import regexText from 'src/helpers/regexText';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
    @InjectModel(Subproduct.name)
    private readonly subproductModel: Model<Subproduct>,
    @InjectModel(Lock.name)
    private readonly lockModel: Model<Lock>,
    @InjectModel(Landing.name)
    private readonly landingModel: Model<Landing>,
  ) { }

  async createTestProd() {
    const prod = {
      active: true,
      buy_price: 10,
      sell_price: 12,
      size: 10,
    };

    const prodSaved = await this.productModel.create(prod);
    await this.subproductModel.create(prod);
    return prodSaved;
  }

  async addStock() {
    await this.subproductModel.updateMany({}, { $set: { stock: 100 } });
  }

  async getSubProductsByProd(idProduct: string) {
    const subprods = await this.subproductModel
      .find({ product: idProduct })
      .exec();
    return subprods;
  }

  async addSubprodToProd() {
    const prods = await this.productModel.find().exec();
    for (const prod of prods) {
      const subprods = await this.subproductModel
        .find({ product: prod._id })
        .exec();
      const subprodIds = subprods.map((elem) => new Types.ObjectId(elem._id));
      await this.productModel.updateOne(
        { _id: prod._id },
        { $push: { subproducts: { $each: subprodIds } } },
      );
    }
  }

  parseFilterData(queryParams: any): FilterDto {
    const page = parseInt(queryParams.page) || 1;
    const input = queryParams.input || '';

    const age = Array.isArray(queryParams.age) ? queryParams.age : (queryParams.age ? queryParams.age.split(',') : []);
    const size = Array.isArray(queryParams.size) ? queryParams.size : (queryParams.size ? queryParams.size.split(',') : []);
    const animal = Array.isArray(queryParams.animal) ? queryParams.animal : (queryParams.animal ? queryParams.animal.split(',') : []);

    const price = parseInt(queryParams.price) || 0;

    return { page, input, age, size, animal, price };
  }

  async getFilteredProducts(filterData: FilterDto): Promise<ProductPaginationDto> {
    const { animal, size, age, price, input, page } = this.parseFilterData(filterData);

    const productsPerPage = 20;
    const skip = (page - 1) * productsPerPage;
    const conditions: any[] = [{ active: true }];

    if (input && input.length > 0) {
      const searchTerms = input.split(/\s+/).filter(Boolean);
      const regexQueries = searchTerms.map((term) => ({
        name: { $regex: new RegExp(regexText(term), 'i') },
      }));
      conditions.push({ $or: regexQueries }); // Use $or for searching multiple terms.
    }
    if (animal && animal.length > 0) {
      conditions.push({ animal: { $in: animal } });
    }
    if (size && size.length > 0) {
      conditions.push({ animal_size: { $in: size } });
    }
    if (age && age.length > 0) {
      conditions.push({ animal_age: { $in: age } });
    }

    const [filterResults, totalCount] = await Promise.all([
      this.productModel
        .find({ $and: conditions })
        .populate('subproducts')
        .sort({ name: 1 })
        .skip(skip)
        .limit(productsPerPage)
        .exec(),
      this.productModel.countDocuments(conditions.length > 0 ? { $and: conditions } : {}).exec(),
    ]);

    const updatedFilterResults = await this.processFilterResults(filterResults, price, this.lockModel);

    const totalPages = Math.ceil(totalCount / productsPerPage);

    return {
      subproducts: updatedFilterResults,
      total_products: totalCount,
      page: page,
      total_pages: totalPages,
    };
  }

  async processFilterResults(filterResults: Product[], price: number, lockModel: Model<Lock>) {
    const updatedFilterResults = await Promise.all(filterResults.map(async (product) => {
      if (price) {
        product.subproducts = product.subproducts.filter((subprod) => subprod.sale_price <= price);
      }

      for (const subprod of product.subproducts) {
        if (subprod.has_lock) {
          const subprodLocked = await lockModel
            .findOne({ subproduct: subprod._id })
            .lean()
            .exec();
          if (subprodLocked) {
            subprod.stock -= subprodLocked.quantity;
          }
        }
      }

      return product;
    }));

    return updatedFilterResults.filter((prod) => prod.subproducts.length > 0);
  }

  async uploadCloudinaryImage(
    image_url: string,
    prod_id: string,
    prod_name: string,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });

    const res = await cloudinary.uploader.upload(image_url, {
      public_id: prod_id,
    });

    res
      .then((data: any) => {
        console.log(data);
        console.log(data.secure_url);
      })
      .catch((err: any) => {
        console.log(err);
      });

    const url = await cloudinary.url(prod_name, {
      width: 80,
      height: 150,
      Crop: 'fill',
    });

    // The output url
    console.log(url);
    // https://res.cloudinary.com/<cloud_name>/image/upload/h_150,w_100/olympic_flag
  }

  async getProductsMovementSearch(input: string) {
    const [activeProds] = await Promise.all([
      this.productModel
        .find({ name: { $regex: input, $options: 'i' } })
        .populate({
          path: 'subproducts',
          options: { sort: { size: 1 } },
          select: '_id sell_price size stock sale_price',
        })
        .select('_id name subproducts')
        .sort({ name: 1 })
        .lean(),
    ]);

    return activeProds;
  }


  async createProds() {
    const prods = await this.productModel.find().select('_id')
    for (let prod of prods) {
      const subp = await this.subproductModel.find({ product: new Types.ObjectId(prod._id) }).select('_id')
      for (let sub of subp) {
        await this.productModel.findOneAndUpdate(
          { _id: prod._id },
          { $push: { subproducts: new Types.ObjectId(sub._id) } }
        )
      }
    }
    return 'termino'
  }

  async getLandingImages(type?: LandingType): Promise<Landing[]> {
    const query = type && { type: type }
    return await this.landingModel.find(query)
  }
}
