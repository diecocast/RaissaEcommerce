import pino from "pino"
import __dirname from '../utils.js';
import services from "../dao/services.js";
import io from "../app.js";
import config from "../config/config.js";
import {noUser,UserLogin} from "../middlewares/auth.js"

const streams = [
    {level:'info',stream:process.stdout},
    {level:'warn',stream:pino.destination(__dirname + '/warn.log')},
    {level:'error',stream:pino.destination(__dirname+'/error.log')}
];

const logger = pino({},pino.multistream(streams))

const home = async(req,res)=>{
    try {
        if(!req.session.user){
            let view = await noUser()
            res.render("viewHome",{view})
            io.on('connection',async(socket)=>{
                let products = await services.productsService.getAll()
                let datos = JSON.parse(products)
                io.emit('list',datos)
                io.emit('cartData')

        })}else{
            let view = await UserLogin(req)
            let listCart = await services.cartsService.getCartProducts(req.session.user.cartID)
            let total = await services.cartsService.getTotal(req.session.user.cartID)
            res.render("viewHome",{listCart,total,view})
            io.on('connection',async(socket)=>{
                io.to(socket.id).emit('cartData',{listCart,total,cid:req.session.user.cartID})
                let products = await services.productsService.getAll()
                let datos = JSON.parse(products)
                io.emit('list',datos)
            
            })  

        }
  
    } catch (error) {
        console.log(error)
        logger.error(`Error :  ${error}`)
    }
   
}

const register = (req,res)=>{
    logger.info(`Coneccion recibida en ' /register ' con metodo GET`)
    res.render('register');
};

const login = (req,res)=>{
    logger.info(`Coneccion recibida en ' /login ' con metodo GET`)
    res.render('login')
};

const current = async(req,res)=>{
    logger.info(`Coneccion recibida en ' /Home ' con metodo GET`)

    if(!req.session.user){
     res.render('error',{mensaje:"Credenciales Invalidas"})
    }else{
        res.redirect('/')
    }
}

const logout = (req,res)=>{
    if(!req.session.user){ 
        return res.redirect('/login')
    }

    logger.info(`Coneccion recibida en ' /logout ' con metodo GET`)
    req.session.destroy()
    res.redirect('/')
}




export default{
    register,
    login,
    current,
    logout,
    home,

}