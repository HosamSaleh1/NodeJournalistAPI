const express = require('express')
const app = express()
const port = 3000
const journalistRouter = require('./routers/journalist')
const newsRouter = require('./routers/news')
const cors = require('cors')

require('./db/mongoose')

app.use(express.json())
app.use(cors())

app.use(journalistRouter)
app.use(newsRouter)

app.listen(port,()=>{
    console.log(`Server is running ... on localhost:${port}`)
})