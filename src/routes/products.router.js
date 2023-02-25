import {Router} from 'express';
import {uploader} from '../utils.js';
import productsController from '../controllers/products.controller.js';
const router = Router();

router.get('/',productsController.home);

router.get('/pid',productsController.getById);

router.post('/',uploader.single('thumbnail'),productsController.newProduct);

router.put('/',uploader.single('thumbnailUpdate'),productsController.update);

router.delete('/',productsController.deleteProduct);


export default router;