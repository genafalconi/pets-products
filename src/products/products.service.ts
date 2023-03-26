import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CollectionReference,
  DocumentData,
  QuerySnapshot,
} from 'firebase-admin/firestore';
import { firebaseFirestore } from '../firebase/firebase.app';
import * as xlsx from 'xlsx';
import { v2 as cloudinary } from 'cloudinary';
import { ProductDto } from 'src/dto/product.dto';
import { SubproductDto } from 'src/dto/subproduct.dto';
import { LockSubprodDto } from 'src/dto/lockSubprod.dto';
import { SubproductsService } from 'src/subproducts/subproducts.service';

@Injectable()
export class ProductsService {
  private prodCollection: CollectionReference;
  private subProdCollection: CollectionReference;

  constructor(
    @Inject(SubproductsService)
    private readonly subprodService: SubproductsService,
  ) {
    this.prodCollection = firebaseFirestore.collection('product');
    this.subProdCollection = firebaseFirestore.collection('subproduct');
  }

  async createProduct() {
    const prods = this.getProductsFromExcel();
    await this.prods(prods);
  }

  getProductsFromExcel() {
    const excelFile = xlsx.readFile(
      'C:/Users/genar/Documents/Pets/E-commerce/test.xlsx',
    );
    const nombrePagina = excelFile.SheetNames[0];
    const paginaConDatos = excelFile.Sheets[nombrePagina];

    const products = xlsx.utils.sheet_to_json(paginaConDatos, { header: 1 });
    const newProdFormat = [];

    // Create an object to keep track of unique product names
    const uniqueProductNames = {};

    // Loop through the products array
    products.forEach((elem: any) => {
      const productName = elem[0];

      // If the product name is not already in the uniqueProductNames object, add it and create a new product object
      if (!uniqueProductNames[productName]) {
        const prodToObj = {
          name: productName,
          category: 'hHN53J58oOky8fum9mgq',
          isActive: true,
          highlight: false,
          description: '',
          images: [],
          brand: elem[0].split(' ')[0], // Use the first word of the product name as the brand
          subprod: [],
        };

        uniqueProductNames[productName] = prodToObj;
      }

      // Create a new subproduct object and add it to the product's subprod array
      const subProdToObj: SubproductDto = {
        price: elem[2],
        size: elem[3],
        stock: 100,
        isActive: true,
        idProduct: '',
        idSubprod: '',
      };

      uniqueProductNames[productName].subprod.push(subProdToObj);
    });

    // Sort the subprod array in each product object by size from smaller to larger
    Object.keys(uniqueProductNames).forEach((key: string) => {
      const product = uniqueProductNames[key];
      product.subprod.sort((a, b) => a.size - b.size);
      newProdFormat.push(product);
    });
    const finalProds = this.brandLogic(newProdFormat);

    return finalProds;
  }

  async getActiveProducts() {
    const prodDoc = await this.prodCollection
      .where('isActive', '==', true)
      .get();
    const activeProds: DocumentData[] = [];

    const subProdPromises = prodDoc.docs.map(async (doc) => {
      const subProd = await this.getSubProductsByProd(doc.id);
      if (subProd.length !== 0) {
        subProd.sort((a, b) => a.size - b.size);
        const prodWithId = {
          id: doc.id,
          name: doc.data().name,
          isActive: doc.data().isActive,
          subProd: subProd,
        };
        activeProds.push(prodWithId);
      }
    });

    await Promise.all(subProdPromises);
    activeProds.sort((a, b) => a.name.localeCompare(b.name));

    return activeProds;
  }

  async getSubProductsByProd(idProduct: string) {
    const subprodDoc = await this.subProdCollection
      .where('idProduct', '==', idProduct)
      .get();
    const subprods: DocumentData[] = [];
    subprodDoc.forEach((doc) => {
      const subProdFormat: SubproductDto = {
        idSubprod: doc.id,
        idProduct: doc.data().idProduct,
        isActive: doc.data().isActive,
        price: doc.data().price,
        size: doc.data().size,
        stock: doc.data().stock,
      };
      subprods.push(subProdFormat);
    });
    return subprods;
  }

  async createSubprodsByProd(
    idProduct: string,
    subProds: Array<SubproductDto>,
  ) {
    for (const subprod of subProds) {
      subprod.idProduct = idProduct;
      const newSubprodDocRef = this.subProdCollection.doc();
      console.log(subprod);
      await newSubprodDocRef.set(Object.assign({}, subprod));
    }
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

  brandLogic(products: any) {
    products.map((prod) => {
      const brand = prod.name.split(' ')[0];
      let newBrand: string;
      if (brand) {
        switch (brand) {
          case 'Royal':
            newBrand = 'MEtDTTcAdGEYHRKzZzF0';
            break;
          case 'Pro':
            newBrand = '7NAZuttTpZCgapdG1YJO';
            break;
          case 'Vital':
            newBrand = 'T5UT5R0kmMEOROnHNNqL';
            break;
          case 'Dog':
            newBrand = '67796QaOABtdgy6DuOSJ';
            break;
          case 'Cat':
            newBrand = 'qu7R0FMc1Aa5WfTqv2qp';
            break;
          case 'Old':
            newBrand = 'Y7MvQ7NLNMnJOS0v117G';
            break;
          case 'Pedigree':
            newBrand = '1cXHTTz1gtbIR0odFNGR';
            break;
          case 'Excellent':
            newBrand = '7GZtwNPRvQ8qD92hjacc';
            break;
          case 'Optimum':
            newBrand = 'D6a0s3PswfbkKkbDUm4O';
            break;
          case 'Unik':
            newBrand = 'OEye8IfNeNxaPdTNEpa9';
            break;
          case 'Iams':
            newBrand = 'tQlTIslZdfzs62RKKLCL';
            break;
          case 'Eukanuba':
            newBrand = 'Y7MvQ7NLNMnJOS0v117G';
            break;
          case 'Biopet':
            newBrand = 'zrgq4BJBfJ8yqMUOTjtc';
            break;
          default:
            newBrand = null;
            break;
        }
      }
      prod.brand = newBrand;
    });

    return products;
  }

  async prods(finalProds: Array<any>) {
    finalProds.map(async (elem) => {
      const prod: ProductDto = {
        name: elem.name,
        category: elem.category,
        isActive: elem.isActive,
        highlight: elem.highlight,
        description: elem.description,
        images: elem.images,
        brand: elem.brand,
      };
      const subProds: Array<SubproductDto> = [];
      elem.subprod.map((elem) => {
        subProds.push(elem);
      });
      const prodDoc = await this.prodCollection
        .where('name', '==', elem.name)
        .get();

      let prodSaved: any;
      if (prodDoc.empty) {
        const newProd = prod;
        const prodDocs = this.prodCollection.doc();
        await prodDocs.set(Object.assign({}, newProd));

        const prodGet = await prodDocs.get();
        prodSaved = prodGet.id;
      } else {
        prodSaved = prodDoc.docs.map((doc) => {
          return doc.id;
        });
      }
      console.log('newProd', prodSaved);
      await this.createSubprodsByProd(prodSaved, subProds);
    });
  }
}
