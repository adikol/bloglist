const blogsRouter = require('express').Router()
const jestConfig = require('../jest.config')
const { deleteOne } = require('../models/blog')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = (request, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      return authorization.substring(7)
    }
    return null
}

blogsRouter.get('/', async(request, response) => {
    console.log("getting blogs")
    const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
    response.json(blogs)
})
  
blogsRouter.post('/', async(request, response) => {
    console.log('post request')
    const body = request.body

    if(!('title' in body) || !('url' in body))
    {
        response.status(400).send({error: 'title or url missing'})
    }
    else
    {
        if (!('key' in body))
        {
            body['likes'] = 0;
        }

        const token = getTokenFrom(request)
        const decodedToken = jwt.verify(token, process.env.SECRET)
        if (!token || !decodedToken.id) {
            return response.status(401).json({ error: 'token missing or invalid' })
        }
        const user = await User.findById(decodedToken.id)

        const blog = new Blog({
           title: body.title,
           author: body.author,
           url: body.url,
           likes:body.likes,
           user: user._id
        })
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        response.json(savedBlog)
    }
})

blogsRouter.delete('/:id', async(request, response) => {

    console.log('delete request')
    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = await Blog.findById(request.params.id)
    const user = await User.findById(decodedToken.id)
    console.log('removing with id: ', user.id.toString())
    if(blog.user && blog.user.toString() == user.id.toString())
    {
        await blog.deleteOne()
        response.status(204).end()
    }
    else
        response.status(405).send({error: `user does not exist or does not own the blog`})
})

blogsRouter.put('/:id', async(request, response) => {
    const body = request.body
    const token = getTokenFrom(request)

    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = {
        likes: body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(decodedToken.id, blog, {new: true})
    response.json(updatedBlog)
})

module.exports = blogsRouter