const express = require('express');
const Joi = require('joi');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const loggedIn = require('../../middleware/auth');
const { mysqlConfig } = require('../../config');
const router = express.Router();
const validation = require('../../middleware/validation');

const changePasswords = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
  passwordNew: Joi.string().required(),
});

router.post('/password', loggedIn, validation(changePasswords), async (req ,res) => {
  try{
    let con = await mysql.createConnection(mysqlConfig);
    let [data] = await con.execute(`
      SELECT id, email, password
      FROM users
      WHERE email = ${mysql.escape(req.body.email)}
      LIMIT 1
    `); 

    if(data.length === 0 ){
      return res.status(400).send({ err: 'User not found'});
    }
    
    const chechHash = bcrypt.compareSync(req.body.password, data[0].password);
    
    if(!chechHash){
      return res.status(400).send({ msg:'Wrong password'});
    }
    const newPasswordHash = bcrypt.hashSync(req.body.passwordNew, 10);

    const changePassDBRes = await con.execute(
      `UPDATE users SET password=${mysql.escape(newPasswordHash)} WHERE email=${mysql.escape(req.body.email)}`,
    );

    await con.end();
    return res.send({ msg: 'Password changed' });
  }catch(err){
    console.log(err);
    return res.status(500).send({ err: 'We have some server problems'},
    );
  }
});

module.exports = router;