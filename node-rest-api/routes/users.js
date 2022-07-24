const router=require("express").Router()
const User=require('../models/User');
const bcrypt=require('bcrypt')

//update user
router.put("/:id",async(req,res)=>{
    if(req.body.userId===req.params.id || req.body.isAdmin) {
         if(req.body.password){
            try{
                const salt=await bcrypt.genSalt(10)
                req.body.password=await bcrypt.hash(req.body.password,salt);


            }catch(err){
                console.log(err)
               return res.status(500).json("You can update only your account")
            }

         }
         try{
            const user=await User.findByIdAndUpdate(req.params.id,
                 {$set:req.body}
                )
                res.status(200).json("Account has been updated!")

         }catch(err){
            res.status(500).json(err);
         }
    }else{
        return res.status(403).json("You can update only your account!")
    }
})
// delete user
router.delete("/:id",async(req,res)=>{
    if(req.body.userId===req.params.id || req.body.isAdmin) {
       
         try{
            const user=await User.findByIdAndDelete(req.params.id)
            if(!user) res.status(404).json("User not found")
              res.status(200).json("Account has been deleted!")

         }catch(err){
           // console.log(err)
            res.status(500).json(err);
         }
    }else{
        return res.status(403).json("You can delete only your account!")
    }
})
//get a user

router.get('/:id',async(req,res)=>{
  try{
      const  user=await User.findById(req.params.id);
      const {password,updatedAt,...others}=user._doc
      if(!user) res.status(404).json("user not found") 
      res.status(200).json(others);  

  }catch(err){
    res.status(500).json(err)
  }
})
// follow a user

router.put('/:id/follow',async(req,res)=>{
    if(req.body.userId!==req.params.id)
    {
         try{
            const user=await User.findById(req.params.id);
            const currentUser=User.findById(req.body.userId)
            if(!user.followers.includes(req.body.userId))
            {
                await user.updateOne({$push:{followers:req.body.userId}});
                await currentUser.updateOne({$push:{followings:req.params.id}})
                res.status(200).json("user has been followd") 
            }else{
                res.status(403).json("you already  follow this user")
            }
         }catch(err){

         }
  
    }else{
      res.status(403).json("You can't unfollow your self..")
    }
})

// unfollow a user

router.put('/:id/unfollow',async(req,res)=>{
    if(req.body.userId!==req.params.id)
    {
         try{
            const user=await User.findById(req.params.id);
            const currentUser=User.findById(req.body.userId)
            if(user.followers.includes(req.body.userId))
            {
                await user.updateOne({$pull:{followers:req.body.userId}});
                await currentUser.updateOne({$pull:{followings:req.params.id}})
                res.status(200).json("user has been unfollowd") 
            }else{
                res.status(403).json("you already unfollow this user")
            }
         }catch(err){

         }
  
    }else{
      res.status(403).json("You can't unfollow your self..")
    }
})

// unfollow a user

router.get("/",(req,res)=>{
    res.send("Welcome to User")
})


module.exports=router

