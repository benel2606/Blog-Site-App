var express = require("express");
var router = express.Router();
var Blog = require("../models/blogs");
var Comment = require("../models/comments");

//COMMENT NEW 
router.get("/blogs/:id/comments/new", isLoggedIn, function (req, res) {
    Blog.findById(req.params.id, function (err, blog) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {
                blog: blog
            });
        }
    });
});
//COMMENT CREATE
router.post("/blogs/:id/comments", isLoggedIn, function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            redirect("/blogs");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    foundBlog.comments.push(comment);
                    foundBlog.save();
                    res.redirect("/blogs/" + foundBlog._id);
                }
            });
        }
    });
});
//COMMENT DELETE
router.delete("/blogs/:id/comments/:comment_id", checkCommentAuthorAndLoggedIn, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/blogs/" + req.params.id)
        }
    });
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkCommentAuthorAndLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect("back");
            } else {
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
}

module.exports = router;