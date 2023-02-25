import transporter from '../config/transporter.js';
import __dirname from '../utils.js';
import config from '../config/config.js';
import pino from "pino"

const streams = [
    {level:'info',stream:process.stdout},
    {level:'warn',stream:pino.destination(__dirname + '/warn.log')},
    {level:'error',stream:pino.destination(__dirname+'/error.log')}
]
const logger = pino({},pino.multistream(streams))

const register = async(req,res)=>{
    try {
        await transporter.sendMail({
            from: "AdminEcommerce", 
            to: config.admin.ADMIN_GMAIL, 
            subject: `Nuevo Registro a tu pagina`, 
            text:`Se registro un nuevo usuario: Name: ${req.user.name},Email: ${req.user.email},Number: ${req.user.phone_number}, Addres: ${req.user.address}` , 
            html: `<p>Se registro un nuevo usuario: <h4>Name: ${req.user.name}</h4><br><h4>Email: ${req.user.email}</h4><br><h4>Number: ${req.user.phone_number}</h4><br><h4>Addres: ${req.user.address}</h4></p>` // html body
          });
        logger.info(`New register`)
        res.send({status:"succes",payload:req.user._id})
    } catch (error) {
        logger.error(`Error :  ${error}`)
    }
};

const registerfail = (req,res)=>{
    res.status(400).send({status:"error",error:'You are already registered'})
};

const login = async(req,res)=>{
    try {
        req.session.user = {
            name:req.user.name,
            email:req.user.email,
            cartID:req.user.cartID,
            address:req.user.address,
            city:req.user.city,
            phone_number:req.user.phone_number,
            id:req.user._id
        }
        res.status(200).send({status:'succes',payload:req.session.user})
    } catch (error) {
    logger.error(`Error :  ${error}`)
}}

const loginfail = (req,res)=>{
   res.status(400).send({status:"error",error:"Invalid Password or no Register"})

};

export default{
    register,
    registerfail,
    login,
    loginfail
}