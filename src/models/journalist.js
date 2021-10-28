const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
const { validate } = require('./news')

const journalistSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:3
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error ("Email is invalid")
            }
        }
    },
    phone:{
        type:Number,
        required:true,
        trim:true,
        minlength:11,
        validate(value){
            if(!validator.isNumeric(value.toString(),'ar-EG')){
                throw new Error ("Phone Num is invalid")
            }
        }

    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:6
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
    avatar:{
        type:Buffer
    }
})


// Hashing Password
journalistSchema.pre('save',async function(next){
    const journalist = this
    if(journalist.isModified('password')){
        journalist.password = await bcrypt.hash(journalist.password,8)
    }
    next()
})

// Login function
journalistSchema.statics.findByCredentials = async (email,password)=>{
    const journalist = await Journalist.findOne({email})
    if (!journalist){
        throw new Error ('Can not login, Wrong Email or Password')
    }
    const isMatch = await bcrypt.compare(password,journalist.password)
    if(!isMatch){
        throw new Error ('can not login, Wrong Email or Password')
    }
    return journalist
}

// JWT function
journalistSchema.methods.generateToken = async function(){
    const journalist = this
    const token = JWT.sign({_id:journalist._id.toString()},'NodeJournalistAPI',{expiresIn: '7 days'})
    journalist.tokens = journalist.tokens.concat({token})

    await journalist.save()

    return token
}

// Relations Virtual
journalistSchema.virtual('news',{
    ref:'News',
    localField:'_id',
    foreignField:'owner'
})
// to Object function
journalistSchema.methods.toJSON = function(){
    const journalist = this
    const journalistObject = journalist.toObject()
    delete journalistObject.password
    delete journalistObject.tokens

    return journalistObject
}

// Journalist Model
const Journalist = mongoose.model('Journalist',journalistSchema)

module.exports = Journalist