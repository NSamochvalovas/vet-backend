const express = require('express');
const Joi = require('joi');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');
const { mysqlConfig } = require('../../config');
const router = express.Router();
const validation = require('../../middleware/validation');


const forgotSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

router.post('/reset-password', validation(forgotSchema), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    let [data] = await con.execute(`SELECT id FROM users WHERE email = ${mysql.escape(req.body.email)} LIMIT 1`);

    if (data.length !== 1) {
      await con.end();
      return res.send({ msg: 'If your email is correct, you will shortly get an email.' });
    }

    const randomCode = (Math.random() + 1).toString(36).substring(2);
    const hashedPassword = bcrypt.hashSync(randomCode, 10);

    const [data2] = await con.execute(`UPDATE users SET password='${hashedPassword}' WHERE email=${mysql.escape(req.body.email)}`,);

    await con.end();

    if (!data2.insertId) {
      return res.status(500).send({ msg: 'Server issue occured. Please try again later1' });
    }

    const response = await fetch('https://dolphin-app-gsx4u.ondigitalocean.app/send', {
      method: 'POST',
      body: JSON.stringify({
        password: 'PetrasGeriausiasDestytojas',
        email: req.body.email,
        message: `Your password reset code is: ${randomCode}`,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await response.json();

    if (!json.info) {
      return res.status(500).send({ msg: 'Server issue occured. Please try again later' });
    }

    return res.send({ msg: 'If your email is correct, you will shortly get a message' });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: 'Server issue occured. Please try again later' });
  }
});


module.exports = router;