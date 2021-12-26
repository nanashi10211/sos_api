const User = require("../models/User");
const bcrypt = require("bcrypt");
const router = require('express').Router();


// update user
router.put("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        if(req.body.password) {
            try {
                const salt = await bcrypt.genSalt(12);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }
            catch (err) {
                return res.status(500).json("Internal password error");
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id,{
                $set: req.body
            });
            res.status(200).json("Account has been updated");
        } catch(err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You are no author to update");
    }
});

// delete user
router.delete("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            if(await User.findById(req.params.id)) {
                const user = await User.deleteOne({_id: req.params.id});
                console.log(Boolean(user));
                res.status(200).json("Account has been deleted successfully");
            } else {
                res.status(200).json("Account not exsits");

            }
        } catch(err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can delete only your account");
    }
});
// get a user
router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId ? await User.findById(userId) : await User.findOne({username: username});
        const {password,updatedAt,createdAt,...other} = user._doc;
        if(user) {
            res.status(200).json(user);
        } else {
            res.status(404).json("user not found");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// follow a user
router.put('/:id/follow',async (req,res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({$push: {followers: req.body.userId}});
                await currentUser.updateOne({$push: {followings: req.params.id}});
                res.status(200).json(`${currentUser.username} is following ${user.username}`); 
            } else {
                res.status(403).json("you allready following this user");
            }
        } catch (err) {
            res.status(500).json("opps something wrong");
        }
    } else {
        res.status(403).json("you can not follow yourself");
    }
});
// unfollow a user
router.put('/:id/unfollow',async (req,res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({$pull: {followers: req.body.userId}});
                await currentUser.updateOne({$pull: {followings: req.params.id}});
                res.status(200).json(`${currentUser.username} is unfollow ${user.username}`); 
            } else {
                res.status(403).json("you allready following this user");
            }
        } catch (err) {
            res.status(500).json("opps something wrong");
        }
    } else {
        res.status(403).json("you can not unfollow yourself");
    }
});
module.exports = router;