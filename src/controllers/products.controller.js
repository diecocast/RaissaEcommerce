import services from "../dao/services.js";
import __dirname from "../utils.js";
import io from '../app.js';
import pino from "pino"
import config from "../config/config.js";

const streams = [
    {level:'info',stream:process.stdout},
    {level:'warn',stream:pino.destination(__dirname + '/warn.log')},
    {level:'error',stream:pino.destination(__dirname+'/error.log')}
]
const logger = pino({},pino.multistream(streams))
const admin = true;

const home = async(req,res)=>{
    try {
        if(!req.session.user){
            return res.redirect('/login')
        }
        
        if(config.admin.ADMIN_GMAIL!=req.session.user.email){ 
            return res.redirect('/')
        }
        console.log(req.session.user.email)
        logger.info(`Conexión recibida en ' /api/products/ ' con metodo GET`)
        let products= await services.productsService.getAll()
        
        res.render('productsManager',{
            products})

    } catch (error) {
        
    }
}

const getById = async(req,res)=>{
    try {
        if(!req.session.user){ 
            return res.status(400).send({success:"Error", messaje:"Please login firts"}).redirect('/login')
        }
    
        logger.info(`Conexión recibida en ' /api/products/pid ' con metodo GET`)
        let number = req.query.pid
        let productid = await services.productsService.getById(number)
        res.send(productid)
    } catch (error) {
        
    }
}

const newProduct = async(req,res)=>{
    if(!req.session.user){
        return res.redirect('/login')
    }
    
    if(config.admin.ADMIN_GMAIL!=req.session.user.email){ 
        return res.redirect('/')
    }

    logger.info(`Conexión recibida en ' /api/products/ ' con metodo POST`)
    let photo = req.file.filename
    let product = req.body
    product.thumbnail = photo
    await services.productsService.save(product)
    let products = await services.productsService.getAll()
    let datos = JSON.parse(products)
    datos.push({cartID:req.session.user.cartID})
    io.emit('list',datos)
    res.send({status:"succes", message:"Product Added"})
}

const update = async(req,res)=>{
    if(!req.session.user){ 
        return res.redirect('/login')
    }
    if(config.admin.ADMIN_GMAIL!=req.session.user.email){ 
        return res.redirect('/')
    }

   logger.info(`Conexión recibida en ' /api/products/ ' con metodo PUT`)
   let photo = req.file.filename
   let product = req.body
   product.thumbnail = photo
   await services.productsService.update(product)
   let products = await services.productsService.getAll()
   let datos = JSON.parse(products)
   datos.push({cartID:req.session.user.cartID})
   io.emit('list',datos)
   res.send({status:"succes", message:"Product Update"})
}

const deleteProduct = async(req,res)=>{
    if(!req.session.user){ 
        return res.redirect('/login')
    }

    if(config.admin.ADMIN_GMAIL!=req.session.user.email){ 
        return res.redirect('/')
    }

   logger.info(`Conexión recibida en ' /api/products/ ' con metodo DELETE`)
   let id = req.body
   await services.productsService.deleteById(id.pid)
   let products = await services.productsService.getAll()
   let datos = JSON.parse(products)
   io.emit('list',datos)
   res.send({status:"succes", message:"Product Delete"})
}

export default{
    home,
    getById,
    newProduct,
    update,
    deleteProduct
}