const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { check, validationResult } = require('express-validator')

const User = require('../models/User')
const Post = require('../models/Post')


// Create a post
router.post('/', [auth, [
  check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {

  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {

    const user = await User.findById(req.user.id).select('-password')

    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      user: req.user.id
    })

    const post = await newPost.save()

    res.json(post)

  } catch(err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})



// Get all posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 })
    res.json(posts)
  } catch(err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})



// Get a certain post
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    // If post doesn't exist
    if(!post) {
      res.status(404).json({ msg: 'Post not found' })
    }
    // Else
    res.json(post)

  } catch(err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})



// Delete a certain post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    // If post doesn't exist
    if(!post) {
      return res.status(401).json({ msg: 'Post not found' })
    }
    // Check if the user has the permission to delete this post (Check if he created it)
    if(post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' })
    }
    // Else
    await post.remove()

    res.json({ msg: 'Post removed' })

  } catch(err) {
    console.error(err.message)
    res.status(500).json({ msg: 'Server Error' })
  }
})



// Like a certain post ( Just update the like object..)
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    // Check if post has already been liked
    // ( Compares current user that's trying to like the post to users that already liked the post )
    if(post.likes.filter( (like) => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({ msg: 'Post already liked' })
    }

    post.likes.unshift({ user: req.user.id })

    await post.save()

    res.json(post.likes)
  } catch(err) {
    console.error(err.message)
    res.status(500).json({ msg: 'Server Error' })
  }
})



// Unlike a certain post ( Just remove the like, you can't really unlike ( downvote) something )
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    // Read the comment from the former like/unlike function
    if(post.likes.filter( (like) => like.user.toString() === req.user.id).length = 0) {
      return res.status(400).json({ msg: 'Post hasn\'t been liked yet' })
    }

    const removeIndex = post.likes.map( like => like.user.toString()).indexOf(req.user.id)

    post.likes.splice(removeIndex, 1)

    await post.save()

    res.json(post.likes)

  } catch(err) {
    console.error(err.message)
    res.status(500).json({ msg: 'Server Error' })
  }
})



// Create a comment on a certain post
router.post('/comment/:id', [auth, [
  check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {

    const user = await User.findById(req.user.id).select('-password')

    const post = await Post.findById(req.params.id)

    // Create a comment object
    const newComment = {
      text: req.body.text,
      name: user.name,
      user: req.user.id
    }

    post.comments.unshift(newComment)

    await post.save()

    res.json(post.comments)

  } catch(err) {
    console.err(err.message)
    res.status(500).json({ msg: 'Server Error' })
  }
})



// Delete a certain comment
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    // Get the comment from the post
    const comment = post.comments.find( (comment) => comment.id === req.params.comment_id)

    // Check if comment exists
    if(!comment) {
      return res.status(401).json({ msg: 'Comment not found' })
    }

    // Check if user has the permissions to delete this comment
    if(comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Authorization failed' })
    }

    const removeIndex = post.comments.map( comment => comment.user.toString()).indexOf(req.user.id)

    await post.save()

    res.json(post.comments)
  } catch(err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})


module.exports = router
