import {Router} from 'express';
import cartsController from '../controllers/carts.controller.js';

const router = Router();

router.get('/:cid/products',cartsController.getCartProducts)

router.post('/',cartsController.createCart)

router.post('/products',cartsController.addProduct)

router.delete('/:cid',cartsController.deleteCart)

router.post('/delete',cartsController.deleteProduct)

router.post('/endshop',cartsController.endshop)


export default router;