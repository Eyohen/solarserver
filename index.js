const express = require('express');
const db = require ('./models');
const user = require("./route/user");
const auth =  require("./route/auth");
const product =  require('./route/product');
const purchase =  require('./route/purchase');
const category =  require('./route/category');
const review = require('./route/review');
const blog = require('./route/blog');
const cart = require('./route/cart');
const deliveryRate = require('./route/deliveryRate');
const brand =  require('./route/brand');
const calculator =  require('./route/calculator');
const estimate =  require('./route/estimate');


const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');


const app = express();
const port = process.env.API_PORT;


app.use(cors({
    origin: ['http://localhost:5173', 'https://solarpaddy-five.vercel.app'],
    //origin: '*',  // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-reset-token'],
    credentials: false  // Set to false when using origin: '*'
  }));
app.use(morgan('dev'))
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));
app.use(express.json());



db.sequelize
    .authenticate()
    .then(() => {
        console.log(`postgres connection has been established successfully... ${process.env.NODE_ENV}`)
    })
    .catch((err) => {
        console.log(`unable to connect to the database ${err.message}`)
        if(
            err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefuseError'
        ){
            console.log('the database is disconnected please check the connection and try again')
        }
        else{
            console.log(`An error occured while connecting to the database: ${err.message}`)
        }
    })
    

app.use((req, res, next)=>{
    console.log(`incoming request... ${req.method} ${req.path}`)
    next()
})

app.use("/api/auth", auth);
app.use("/api/users", user);
app.use("/api/products", product);
app.use("/api/calculator", calculator);
app.use("/api/purchases", purchase);
app.use("/api/categories", category);
app.use("/api/reviews", review);
app.use("/api/posts", blog);
app.use("/api/cart", cart);
app.use("/api/deliveryrates", deliveryRate)
app.use("/api/brands", brand)
app.use("/api/estimate", estimate)



if (process.env.NODE_ENV === 'development') {
    // PORT = process.env.TEST_PORT;
    drop = { force: true };
}

db.sequelize.sync({alter:true}).then(() => {
    console.log('All models were synchronized successfully')
    app.listen(port, () => {
        console.log(`App listening on port ${port}`)
    })
})