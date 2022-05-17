const express = require("express");
const cors = require("cors");
const UserRouter = require('./routes/v1/users');
const changepassRouter = require('./routes/v1/changepass');
const forgotpassRouter = require('./routes/v1/forgotpass');
const petsRouter = require('./routes/v1/pets');

const { serverPort } = require('./config')

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send({ msg: 'Server is running'});
});

app.use('/users', UserRouter);
app.use('/change', changepassRouter);
app.use('/forgot', forgotpassRouter);
app.use('/pets', petsRouter);

app.all('*', (req, res) => {
  res.status(404).send({ err: 'page not found'});
});

app.listen(serverPort, () => console.log("server is runing"));


