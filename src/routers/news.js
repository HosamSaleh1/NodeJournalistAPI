const {ObjectId} = require('bson')
const express = require('express')
const router = new express.Router()
const News = require('../models/news')
const auth = require('../middelware/auth')

// get all
router.get('/allNews',auth,async(req,res)=>{
    try{
        await req.journalist.populate('news')
        if(!req.journalist.news){
            return "There is no News found"
        }
        res.status(200).send(req.journalist.news)
    }
    catch(e){
        res.status(500).send("Error: ", e)
    }
})

// get by id
router.get('/allNews/:id',auth,(req,res)=>{
    const _id = req.params.id
    News.findOne({_id,owner:req.journalist._id})
    .then((news)=>{
        if(!news){
            return res.status(400).send('No News is found')
        }
        res.status(200).send(news)
    }).catch((e)=>{
        res.status(400).send('Error: ', e)
    })
})

// post news
router.post('/addNews',auth,(req,res)=>{
    const news = new News({
        ...req.body,
        owner:req.journalist._id
    })
    news.save()
    .then(()=>{
        res.status(200).send(news)
    }).catch((e)=>{
        res.status(400).send('err' + e)
    })
})

// update news
router.patch('/updateNews/:id',auth,async(req,res)=>{
    const updates = ObjectId.keys(req.body)
    const allowedUpdates = ['title','description','date']
    const isValid = updates.every((update)=>allowedUpdates.includes(update))
    if(!isValid){
        return res.status(400).send('Can not update')
    }
    const _id = req.params.id
    try{
        const news = await News.findOne({_id,owner:req.journalist._id})
        if(!news){
            return res.status(404).send('News Not Found')
        }
        updates.forEach((update) => {
            news[update] = req.body[update],{new:true}
        });
        await news.save()
        res.status(200).send(news)
    }
    catch(e){
        res.status(400).send('Error: ',e)
    }
})

//delete news
router.delete('/deleteNews/:id',auth,async(req,res)=>{
    const _id = req.params.id
    try{
        const news = await News.findByIdAndDelete(_id)
        if(!news){
            return res.status(400).send('No News Found')
        }
        res.status(200).send(news)
    }catch(e){
        res.status(400).send('Error: ', e)
    }
})

// Export Module
module.exports = router