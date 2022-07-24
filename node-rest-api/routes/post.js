const router=require('express').Router()
const Post=require('../models/Post');
const User=require('../models/User')
///create a post
router.post("/",async(req,res)=>{
   
    const newPost=new Post(req.body)
    try{
       const savedPost=await  newPost.save();
       res.status(200).json(savedPost);
    }catch(err){
       res.status(500).json(err);
    }
})

//update a post
router.put('/:id',async(req,res)=>{

    try{
        const post=await Post.findOne({userId:req.params.id});
     // here we execute direct mongo function because mongoose(findById) take more time than findOne()
      
     if(post.userId===req.body.userId){
          await post.updateOne({$set:req.body})
          return res.status(200).json("Post has been updated")
    }else{
       res.status(403).json("you can update only your post")
    }
    
  }catch(err){
         console.log(err)
         res.status(500).json(err)
  }
})

// delete a post
router.delete('/:id',async(req,res)=>{

    try{
        const post=await Post.findOne({userId:req.params.id});
     // here we execute direct mongo function because mongoose(findById) take more time than findOne()
      
     if(post.userId===req.body.userId){
          await post.deleteOne()
          return res.status(200).json("Post has been deleted")
    }else{
       res.status(403).json("you can delete only your post")
    }
    
  }catch(err){
        // console.log(err)
         res.status(500).json(err)
  }
}) 

// like || dislike a post
router.put("/:id/like",async(req,res)=>{
    try{
        const post=await  Post.findOne({userId:req.params.id});
        if(!post.likes.includes(req.body.userId)){
               await post.updateOne({$push:{likes:req.body.userId}})
               res.status(500).json("The post has been liked")
        }else{
            await post.updateOne({$pull:{likes:req.body.userId}})
            res.status(200).json("The post has been dislike")
        }
    }catch(err){
        console.log(err)
     return res.status(500).json(err)
    }
})

// get a post
router.get('/:id',async(req,res)=>{
    try{
        const post=await Post.findOne({userId:req.params.id});
        res.status(200).json(post);

    }catch(e){
        res.status(500).json(e)
    }
})


//  get timeline post
router.get("/timeline/all",async(req,res)=>{

    try{
        
        const currentUser=await User.findById({_id:req.body.userId}).lean(); // get user by id here we get for example ajay
        console.log(currentUser)
        const  userPost=await Post.find({userId:currentUser._id}).lean(); // here we get all post by ajay  
        console.log(userPost)
        const friendPost=await Promise.all(
            // ajay followings john and rahul  
            /// we get ajay's friend id and find post his friend post
            currentUser.followings.map(friendId=>{
               return  Post.find({userId:friendId})
            })
        )
        // here we concat ajay's post and his friend post
     res.json(userPost.concat(...friendPost))
    }catch(e){
        console.log(e)
        res.status(500).json(e)
    }
})

 
module.exports=router;