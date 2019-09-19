const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const User = require('../models/User')


// Login

router.post('/login', [
  check('email', 'Email is required').not().isEmpty(),
  check('password', 'Password is required').not().isEmpty(),
  async (req, res) => {

    const errors = validationResult(req)
    if( !errors.isEmpty() ) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {

      let user = await User.findOne({ email: email })

      if(!user) {
        res.status(400).json({ errors: [{ msg:'Auth failed' }]})
      }


      // Validate password
      const isMatch = await bcrypt.compare(password, user.password)

      if(!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Auth failed' }]})
      }

      const payload = {
        user: {
          id: user.id
        }
      }

      // Creates a token
      jwt.sign(payload, process.env.JWT_KEY, { expiresIn: 1800}, (err, token) => {
        if(err) {
          throw err
        } else {
          // As I already explained it, it sends token so it can be used for validation
          res.json({ token })
        }
      })

    } catch(err) {
      console.log(err.message)
      res.status(500).send('Server error')
    }
  }
])

module.exports = router
