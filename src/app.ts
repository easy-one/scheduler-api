import * as express from 'express'
import * as http from 'http'
import * as mongoose from 'mongoose'
import * as bodyParser from "body-parser"
import * as cors from "cors"
import {jwtAuth} from "./jwt"
import {authRoutes} from "./routes/authRoutes"
import {userRoutes} from "./routes/userRoutes"
import {monthRoutes} from "./routes/monthRoutes"
import {ADMIN_EMAILS} from "./config/jwtConfig";
import {UserModel} from './models/userModel'

const port = process.env.PORT || 3333
const mongoUrl = process.env.MONGOLAB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/test'

// mongoose.Promise = global.Promise;
mongoose.connect( mongoUrl, { useMongoClient: true })
mongoose.connection.on('error',(err) => console.log('Error when connecting to mongodb'))
mongoose.connection.on('connected',() => {
  console.log('Connected to mongodb :)')

  UserModel.remove({})

  ADMIN_EMAILS.forEach((email, i) => {
    const user = new UserModel({
      email: email,
      _id: i
    })
    user.save()
    console.log(email + ' added as a user')
  })

})

const app = express()
const server = http.createServer(app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

app.get('/ping', (req, res) => {
  res.send('pong')
})
app.use( '/', authRoutes )
app.all( '/*', [jwtAuth] )
app.use( '/', userRoutes )
app.use( '/', monthRoutes )

// error handling
app.use(function(error, request, response, next) {
  error.stack && console.error(error.stack)
  response.status(error.status || 500).send({message: error.message || 'unhandled'})
})


server.listen(port, () => {
  console.log(`app listening on port ${port}`)
})