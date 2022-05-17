const express = require('express');
const fetch = require('node-fetch');
const mysql = require('mysql2/promise');
const Joi = require('joi');
const loggedIn = require('../../middleware/auth');
const validation = require('../../middleware/validation');
const { mysqlConfig } = require('../../config');

const petRegistration = Joi.object({
  ownerEmail: Joi.string().email().lowercase().required(),
  name: Joi.string().required(),
});

const router = express.Router();

router.get('/', loggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute('SELECT * FROM pets');
    await con.end();

    return res.send(data);
  } catch (err) {
    return res.status(500).send({ msg: 'something wrong with server, please try again later' });
  }
});

router.post('/add', loggedIn, validation(petRegistration), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
        INSERT INTO pets (name, ownerEmail)
        VALUES (${mysql.escape(req.body.name)}, ${mysql.escape(req.body.ownerEmail)})
    `);
    await con.end();

    if (!data.insertId) {
      return res.status(500).send({ msg: 'something wrong with server, please try again later' });
    }

    return res.send({ msg: 'Successfully added a pet' });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ msg: 'something wrong with server, please try again later' });
  }
});

module.exports = router;