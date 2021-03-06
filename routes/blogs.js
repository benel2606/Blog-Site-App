var express = require("express");
var router = express.Router();
var Blog = require("../models/blogs");
var middleware = require("../middleware")

router.get("/", function (req, res) {
    res.redirect("/blogs");
});
//INDEX
router.get("/blogs", function (req, res) {
    Blog.find({}, function (err, blogs) {
        if (err) {
            console.log("MongoDB ERROR!");
        } else {
            res.render("blogs/index", {
                blogs: blogs,
                currentUser: req.user
            });
        }
    });
});
//NEW
router.get("/blogs/new", middleware.isLoggedIn, function (req, res) {
    res.render("blogs/new");
});
//CREATE
router.post("/blogs", middleware.isLoggedIn, function (req, res) {
    var title = req.body.blog.title;
    var image = req.body.blog.image;
    var body = req.body.blog.body;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newObjBlog = {
        title: title,
        image: image,
        body: body,
        author: author
    }
    Blog.create(newObjBlog, function (err, newBlog) {
        if (err) {
            res.render("blogs/new");
        } else {
            res.redirect("/blogs");
        }
    });
});
//SHOW
router.get("/blogs/:id", function (req, res) {
    Blog.findById(req.params.id)
        .populate("comments")
        .exec(function (err, foundBlog) {
            if (err) {
                res.redirect("/blogs");
            } else {
                res.render("blogs/show", {
                    blog: foundBlog
                });
            }
        });
});
//EDIT
router.get("/blogs/:id/edit", middleware.checkPostAuthorAndLoggedIn, function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("blogs/edit", {
                blog: foundBlog
            });
        }
    });
});
//UPDATE
router.put("/blogs/:id", function (req, res) {
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (
        err,
        updatedBlog
    ) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});
//DELETE
router.delete("/blogs/:id", middleware.checkPostAuthorAndLoggedIn, function (req, res) {
    Blog.findByIdAndDelete(req.params.id, function (err) {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

module.exports = router;