const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/is-auth');
// create a post
router.post("/", async (req,res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    }
    catch(err) {
        res.status(500).json(err);
    }
});
// update a post
router.put("/:id",async (req,res) =>{
    try {
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId) {
            await post.updateOne({$set: req.body});
             return res.status(200).json("The post has beed updated");
        } else {
            return res.status(400).json("You cannot edit someone else posts");
        }

    } catch (err) {
        return res.status(500).json(err);
    }
 });
// delete a post
router.delete("/:id",async (req,res) =>{
    try {
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId) {
            await post.deleteOne();
             return res.status(200).json("The post has beed deleted successfully");
        } else {
            return res.status(400).json("You cannot delete  someone else posts");
        }

    } catch (err) {
        return res.status(500).json(err);
    }
 });
// like // dislike a post
router.put("/:id/like", async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)) {
            await post.updateOne( {$push: { likes:req.body.userId } } );
            return res.status(200).json(`You liked this [ ${post.desc} ]`);
        } else {
            await post.updateOne( { $pull: {likes: req.body.userId} });
            return res.status(200).json(`You disliked this [ ${post.desc} ]`);

        }

    } catch (err) {
        return res.status(500).json(err);
    }
});
// get a post
router.get("/:id",auth,async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json(err);
    }
});
// get timeline posts
router.get('/timeline/:id', async (req,res) => {
    try {
        console.log(req.params.id);
        const currentUser = await User.findById(req.params.id);
        const userPosts = await Post.find({userId: currentUser._id});
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
               return Post.find({userId: friendId});
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts));
    } catch (error) {
        return res.status(500).json("srroy something went wrong");
    }
});

// get user's all posts
router.get('/profile/:username', async (req,res) => {
    try {
        console.log(req.params.username);
        const user = await User.findOne({username: req.params.username});
        const posts = await Post.find({userId: user._id});
        res.status(200).json(posts);
    } catch (error) {
        console.log("server error");
        return res.status(500).json("srroy something went wrong");
    }
});



module.exports = router;