const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router()
const auth = require('../middleware/auth')
const { check, validationResult } = require('express-validator')

const User = require('../models/User')


// Sign up

router.post('/signup', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Email is required').not().isEmpty(),
  check('password', 'Password must have at least 6 characters').isLength({ min: 6 }),

  async (req, res) => {

    // Thanks brad
    const errors = validationResult(req)
    if( !errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body

    try {

      // Check if email is available
      let user = await User.findOne({ email:email })

      // If email is taken
      if(user) {
        res.status(400).json({ errors: [{ msg:'User already exists' }]})
      }

      // Create user object
      user = new User({
        name,
        email,
        password
      })

      // Salt for passw (10 rounds)
      const salt = await bcrypt.genSalt(10)

      // Next two lines are pretty self-explanatory
      user.password = await bcrypt.hash(password, salt)

      await user.save()

      const payload = {
        user: {
          id: user.id
        }
      }

      // Signing JWT, 1800 -> 30 mins
      jwt.sign(payload, process.env.JWT_KEY, { expiresIn: 1800}, (err, token) => {
        if(err) {
          throw err
        } else {
          // Send token as respose
          res.json({ token })
        }
      })

    } catch(err) {
      console.log(err.message)
      res.status(500).send('Server error')
    }
  }
])



// Getting users info

router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')

    // If user == 1, In other words - if user exists
    if(user > 0) {
      res.json(user)
    } else {
      res.json({ msg: 'User not found' })
    }
  } catch(err) {
    console.log(error.message)
    res.status(500).send('Server error')
  }
})



// Delete user

router.delete('/:userId', (req, res, next) => {
  User.deleteOne({ _id: req.params.userId })
  .exec()
  .then( result => {
    res.status(200).json({
      message: 'User deleted'
    })
  })
  .catch( err => {
    res.status(500).json({
      error: err
    })
  })
})


module.exports = router
