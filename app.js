const express = require('express')
const mongoose = require('mongoose')

const app = express()


// Import routes
const userRoutes = require('./api/routes/user')
const authRoutes = require('./api/routes/auth')
const postRoutes = require('./api/routes/post')

// Connect to DB

mongoose.connect(`mongodb+srv://vosse:${process.env.MONGO_ATLAS_PW}@confession-lkyas.mongodb.net/test?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
})


// Built in express body-parser

app.use(express.urlencoded({ extended: true }))
app.use(express.json({ extended: true }))


// Allow CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET")
    return res.status(200).json({
    })
  }
  next()
})


app.use('/user', userRoutes)
app.use('/auth', authRoutes)
app.use('/post', postRoutes)


port = process.env.PORT || 5000


app.listen(port)
