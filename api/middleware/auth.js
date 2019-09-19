const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  const token = req.header('x-auth-token')

  if(!token) {
    return res.status(401).json({
      msg: 'Missing token'
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY)

    req.user = decoded.user
    next()
  }
  catch(err) {
    res.status(401).json({
      msg: 'Invalid token'
    })
  }
}


module.exports = auth
