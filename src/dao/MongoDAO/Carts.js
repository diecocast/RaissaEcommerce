import mongoose from "mongoose";
import MongoDBContainer from "./mongoDBContainer.js";
import cartProductsDTO from "../DTOs/cartProductsDTO.js";
import MongoProducts from "./Products.js";
import __dirname from "../../utils.js";
import config from "../../config/config.js"
import pino from "pino";
import transporter from "../../config/transporter.js";
const streams = [
  { level: "info", stream: process.stdout },
  { level: "warn", stream: pino.destination(__dirname + "/warn.log") },
  { level: "error", stream: pino.destination(__dirname + "/error.log") },
];
const logger = pino({}, pino.multistream(streams));

let productsService = new MongoProducts();

const collections = "carts";
const productsSchema = mongoose.Schema({
  id: Number,
  timestamp: String,
  products: [],
});

export default class Carts extends MongoDBContainer {
  constructor() {
    super(collections, productsSchema);
  }


  getCartProducts = async (cid) => {
    try {
      let data1 = await productsService.getAll();
      let data = JSON.parse(data1);
      let countQuantity = await this.model.find(
        { id: cid },
        { _id: 0, products: { product: 1, quantity: 1 } }
      );
      let numberQuantity = JSON.parse(JSON.stringify(countQuantity));
      let productsArr = numberQuantity[0].products;
      let list = [];
      Object.values(productsArr).forEach((pid) => {
        let products = data.find((element) => element.id == pid.product);
        if (!products) return "";
        products.quantity = pid.quantity;
        let result = new cartProductsDTO(products);
        list.push(result);
      });
      return list;
    } catch (error) {
      logger.error(`Error :  ${error}`);
      return `There is an error or an invalid product was sent`;
    }
  };

  createCart = async () => {
    try {
      let cart = {};
      let datenow = new Date();
      function generateDatabaseDateTime(date) {
        return date.toISOString().replace("T", " ").substring(0, 19);
      }

      if ((await this.model.countDocuments()) === 0) {
        cart.id = 1;
        cart.timestamp = generateDatabaseDateTime(datenow);
        cart.products = [];
        await this.model.insertMany(cart);
        return cart.id;
      } else {
        let id = await this.model
          .find({}, { id: 1, _id: 0 })
          .sort({ id: -1 })
          .limit(1);
        cart.id = id[0].id + 1;
        cart.timestamp = generateDatabaseDateTime(datenow);
        cart.products = [];
        await this.model.insertMany(cart);
        return `${cart.id}`;
      }
    } catch (error) {
      logger.error(`Error :  ${error}`);
      return "There is an error or you have not created your cart";
    }
  };

  addProduct = async (info) => {
    try {
      let existe = await this.model.countDocuments({
        id: info.cid,
        "products.product": info.pid,
      });
      if (existe >= 1) {
        let countQuantity = await this.model.find(
          { id: info.cid, "products.product": info.pid },
          { _id: 0, products: { product: 1, quantity: 1 } }
        );
        let numberQuantity = JSON.parse(JSON.stringify(countQuantity));
        let productsArr = numberQuantity[0].products;
        productsArr.map(function (dato) {
          if (dato.product == info.pid) {
            dato.quantity = dato.quantity + 1;
          }
        });
        await this.model.updateMany(
          { id: info.cid, "products.product": info.pid },
          { $set: { products: productsArr } }
        );
        return `The quantity was added to the product ${info.pid}`;
      } else {
        await this.model.updateMany(
          { id: info.cid },
          { $push: { products: { product: info.pid, quantity: 1 } } }
        );
        return `Product ${info.pid} was added successfully`;
      }
    } catch (error) {
      logger.error(`Error :  ${error}`);
      return `There is an error, or the cart or the product placed does not exist. Remember how to add "/api/carts/:IDPRODCUT/products/:IDCART"`;
    }
  };

  deleteByCidAndPid = async (info) => {
    try {
      let countQuantity = await this.model.find(
        { id: info.cid, "products.product": info.pid },
        { _id: 0, products: { product: 1, quantity: 1 } }
      );
      let numberQuantity = JSON.parse(JSON.stringify(countQuantity));
      let productsArr = numberQuantity[0].products;
      let productsList = Object.values(productsArr).filter(
        (item) => item.product != info.pid
      );
      await this.model.updateMany(
        { id: info.cid, "products.product": info.pid },
        { $set: { products: productsList } }
      );
      return `Se elimino exitosamente`;
    } catch (error) {
      logger.error(`Error :  ${error}`);
      return `There is an error or an invalid product was sent`;
    }
  };

  endShop = async (user, cid) => {
    try {
      let products = await this.getCartProducts(cid);
      let total = await this.getTotal(cid);
      let mensageData = "";
      for (let i = 0; i <= products.length - 1; i++) {
        mensageData =
          mensageData +
          `<li>${products[i].name}, Cantidad ${products[i].quantity}, Precio por unidad ${products[i].price}</li>`;
      }

      let sendemail = await transporter.sendMail({
        from: "Raissa Accesorios", 
        to: config.admin.ADMIN_GMAIL, 
        subject: `Nuevo pedido de ${user.name}, ${user.email}, ${user.phone_number}`, 
        text: mensageData, 
        html: `<p>El usuario compro lo siguiente = </p><ol>${mensageData}</ol><h1>Total: ${total}</h1>`, 
      });
      return sendemail;
    } catch (error) {
      logger.error(`Error :  ${error}`);
      return `There is an error or your gmail is not valid`;
    }
  };

  getTotal = async (cid) => {
    try {
      let products = await this.getCartProducts(cid);
      let total = 0;
      for (let i = 0; i <= products.length - 1; i++) {
        total = total + products[i].price * products[i].quantity;
      }
      return total;
    } catch (error) {
      logger.error(`Error :  ${error}`);
      return `There is an error${error}`;
    }
  };
}
