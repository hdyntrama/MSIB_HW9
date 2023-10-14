const express = require('express');
const app = express();
const pool = require('./database.js');
const userRouter = require("./router/users.js");
const movieRouter = require("./router/movies.js");
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./documentation/swagger.json');
const morgan = require('morgan')
app.use(morgan('tiny'));

app.use('/api-docs/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use("/login/movies", movieRouter);
app.use("/users", userRouter);
pool.connect((err, res) => {
  console.log(err)
  console.log('connected')
})

app.listen(3005);