import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { Subproduct } from '../schemas/subprod.schema';
import { FilterDto } from 'src/dto/filter.dto';
import { ProductPaginationDto } from 'src/dto/productPagination.dto';
import { Lock } from 'src/schemas/lock.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
    @InjectModel(Subproduct.name)
    private readonly subproductModel: Model<Subproduct>,
    @InjectModel(Lock.name)
    private readonly lockModel: Model<Lock>
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

  async getPaginatedProducts(params: any, page = 1) {
    const productsPerPage = 20;
    const skip = (page - 1) * productsPerPage;
    const query = { active: true, ...params };

    const [activeProds, totalCount] = await Promise.all([
      this.productModel
        .find(query)
        .populate({
          path: 'subproducts',
          options: { sort: { size: 1 } },
          select: '_id sell_price size stock has_lock',
        })
        .select('_id name subproducts highlight image')
        .sort({ name: 1 })
        .skip(skip)
        .limit(productsPerPage)
        .lean()
        .exec(),
      this.productModel.countDocuments(query).exec()
    ]);

    for (let prod of activeProds) {
      for (let subprod of prod.subproducts) {
        if (subprod.has_lock) {
          const subprodLocked = await this.lockModel.findOne({ subproduct: subprod._id }).lean().exec();
          subprod.stock -= subprodLocked.quantity;
        }
      }
    }

    const totalPages = Math.ceil(totalCount / productsPerPage);

    return {
      subproducts: activeProds,
      total_products: totalCount,
      page: page,
      total_pages: totalPages,
    };
  }

  async getActiveProducts(
    animal?: string,
    page = 1,
  ): Promise<ProductPaginationDto> {
    let params = null;
    if (animal) {
      params = { animal: animal };
    }
    return await this.getPaginatedProducts(params, page);
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

  async getFilteredProducts(filterData: FilterDto): Promise<Product[]> {
    const filter = {
      'subproducts.animal': filterData.animal,
      'subproducts.animal_age': filterData.age,
      'subproducts.category': filterData.category,
      'subproducts.active': true,
    };

    if (filterData.size === 'MEDIUM' || filterData.size === 'LARGE') {
      filter['subproducts.animal_size'] = {
        $in: [filterData.size, 'MEDIUM AND LARGE'],
      };
    } else {
      filter['subproducts.animal_size'] = filterData.size;
    }
    console.log(filter);
    const prods: Product[] = await this.productModel
      .aggregate([
        {
          $lookup: {
            from: 'subproducts',
            localField: 'subproducts',
            foreignField: '_id',
            as: 'subproducts',
          },
        },
        {
          $match: filter,
        },
        {
          $sort: { brand: 1 },
        },
      ])
      .exec();

    return prods;
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

  async getProductsByInputSearch(input: string, page = 1) {
    return await this.getPaginatedProducts(
      { name: { $regex: input, $options: 'i' } },
      page,
    );
  }
}
