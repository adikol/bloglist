const logger = require('./logger')
const lodash = require('lodash')

const dummy = (blogs) => {
    return blogs.length
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    let highestArray = blogs.map((blog) => blog.likes)
    let max = highestArray.reduce(function(a, b) {
        return Math.max(a, b);
    });
    return blogs[highestArray.indexOf(max)]
}

const mostBlogs = (blogs) => {
    var grouped = lodash.groupBy(blogs, function (n) {return n.author});
    var biggestAuthor = lodash.max(Object.keys(grouped), obj => grouped[obj]);
    var biggestBlogCount = grouped[biggestAuthor].length
    return {author: biggestAuthor, blogs: biggestBlogCount}
}

const mostLikes = (blogs) => {
    var summary =
        lodash(blogs)
        .groupBy('author')
        .map((objs, key) => ({
            'author': key,
            'likes': lodash.sumBy(objs, 'likes')
        }))
        .value();

    return summary.reduce((max, blog) => max.likes > blog.likes ? max : blog);
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}
