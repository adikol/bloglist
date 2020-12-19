const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

describe('fetch blogs', () => {
    test('blogs are returned as json', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('unique identifier is named as id', async () => {
        const response = await api.get('/api/blogs')
        const body = response.body
        body.forEach((blog) => {
            expect(blog.id).toBeDefined()
        })
    })
})

describe('adding blogs', () => {
    test('add a new blog', async () => {

        const newBlog = {
            _id: "5a422a851b54a676234d17f9",
            title: "Daily Dairy",
            author: "Aditya Kolachana",
            url: "https://adityak.com/",
            likes: 10
        }

    await api
        .post('/api/blogs')
        .set({Authorization: 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkaWtvbCIsImlkIjoiNWZkZDBjOWMwNTcyMjYxODZiZWFkYzQ3IiwiaWF0IjoxNjA4MzgwNTc4fQ.WtJLj0ahiEp-aIc_iu_oJO0oxeHsZCf62yMO8PBhj54'})
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

        const titles = blogsAtEnd.map(n => n.title)
        expect(titles).toContain('Daily Dairy')
    })

    test('add a new blog with likes missing', async () => {

        const newBlog = {
            _id: "5a422a851b54a676234d17f5",
            title: "No Likes",
            author: "Aditya Kolachana",
            url: "https://adityak.com/",
        }

    await api
        .post('/api/blogs')
        .set({Authorization: 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkaWtvbCIsImlkIjoiNWZkZDBjOWMwNTcyMjYxODZiZWFkYzQ3IiwiaWF0IjoxNjA4MzgwNTc4fQ.WtJLj0ahiEp-aIc_iu_oJO0oxeHsZCf62yMO8PBhj54'})
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
        expect(blogsAtEnd[blogsAtEnd.length -1].likes).toBe(0)
    })

    test('add a new blog with url and title missing', async () => {

        const newBlog = {
            _id: "5a422a851b54a676234d17f5",
            author: "Aditya Kolachana",
            likes: 5
        }

    await api
        .post('/api/blogs')
        .set({Authorization: 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkaWtvbCIsImlkIjoiNWZkZDBjOWMwNTcyMjYxODZiZWFkYzQ3IiwiaWF0IjoxNjA4MzgwNTc4fQ.WtJLj0ahiEp-aIc_iu_oJO0oxeHsZCf62yMO8PBhj54'})
        .send(newBlog)
        .expect(400)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })
})

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
  
      await user.save()
    })
  
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'aditya14',
        name: 'Aditya Kolachana',
        password: 'secret',
      }
  
      await api
        .post('/api/users')
        .set({Authorization: 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkaWtvbCIsImlkIjoiNWZkZDBjOWMwNTcyMjYxODZiZWFkYzQ3IiwiaWF0IjoxNjA4MzgwNTc4fQ.WtJLj0ahiEp-aIc_iu_oJO0oxeHsZCf62yMO8PBhj54'})
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })
})

describe('updating blogs', () => {
    test('update likes count in blog with existing id', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]

        const blog = {
            likes: 7
        }

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set({Authorization: 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkaWtvbCIsImlkIjoiNWZkZDBjOWMwNTcyMjYxODZiZWFkYzQ3IiwiaWF0IjoxNjA4MzgwNTc4fQ.WtJLj0ahiEp-aIc_iu_oJO0oxeHsZCf62yMO8PBhj54'})
        .send(blog)
        .expect(200)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
        expect(blogsAtEnd[0].likes).toBe(7)
    })
})

describe('deleting blogs', () => {
    test('delete a blog with a given id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set({Authorization: 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkaWtvbCIsImlkIjoiNWZkZDBjOWMwNTcyMjYxODZiZWFkYzQ3IiwiaWF0IjoxNjA4MzgwNTc4fQ.WtJLj0ahiEp-aIc_iu_oJO0oxeHsZCf62yMO8PBhj54'})
        .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
    })
})

afterAll(() => {
  mongoose.connection.close()
})