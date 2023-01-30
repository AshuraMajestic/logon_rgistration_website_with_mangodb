const jwt = require('jsonwebtoken');
const Register = require('../models/registers');

const auth = async (req, res ,next)=>{
    try {
        const token =req.cookies.jwt;
        const verifyUser = jwt.verify(token,procesws.env.SECRET_KEY);
        
        const user =await Register.findOne({_id:verifyUser._id})

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(404).render("errorpage",{
            errorMessage:("Error happend in authenication")
        });
    }
}

module.exports = auth;