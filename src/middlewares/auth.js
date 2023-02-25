import config from "../config/config.js"

export const noUser = () =>{
    let view = {redirect: "/login", messageRedirect:"Iniciar sesion", value:"Guess"}
    return view
}

export const UserLogin = async(req) =>{
    if(req.session.user.email == config.admin.ADMIN_GMAIL){
        let view = {redirect: "/logout", messageRedirect:"Cerrar sesion", value:req.session.user.cartID, addRedirect: "/api/products/", addMessage:"Controlador de productos"}
        return view
    }else{
        let view = {redirect: "/logout", messageRedirect:"Cerrar sesion", value:req.session.user.cartID}
        return view
    }
}