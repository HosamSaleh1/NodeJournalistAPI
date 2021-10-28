const jwt = require('jsonwebtoken')
const Journalist = require('../models/journalist')

const auth = async (req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')

        const decode = jwt.verify(token,'NodeJournalistAPI')
        console.log(decode)

        const journalist = await Journalist.findOne({_id:decode._is,'tokens.token':token})
        console.log(journalist)
        if(!journalist){
            throw new Error()
        }

        req.journalist = journalist

        req.token = token

        next()
    }
    catch(e){
        res.status(401).send({error:'Sing Up Please'})
    }
}

module.exports = auth