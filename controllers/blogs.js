const blogsRouter = require('express').Router()
const jestConfig = require('../jest.config')
const { deleteOne } = require('../models/blog')
const Blog = require('../models/blog')

blogsRouter.get('/', async(request, response) => {
    console.log("getting blogs")
    const blogs = await Blog.find({})
    response.json(blogs)
})
  
blogsRouter.post('/', async(request, response) => {
    const body = request.body
    if(!('title' in body) || !('url' in body))
    {
        response.status(400).end()
    }
    else
    {
        if (!('key' in body))
        {
            body['likes'] = 0;
        }
        const blog = new Blog(body)
        const savedBlog = await blog.save()
        response.json(savedBlog)
    }
})

blogsRouter.delete('/:id', async(request, response) => {

    console.log('removing with id: ', request.params.id)
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async(request, response) => {
    const body = request.body

    const blog = {
        likes: body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new: true})
    response.json(updatedBlog)
})

module.exports = blogsRouter