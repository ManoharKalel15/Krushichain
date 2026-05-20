const express=require('express');const router=express.Router();
const{MarketListing}=require('../models');
const{protect}=require('../middleware/auth');
router.get('/',async(req,res)=>{
  try{const{district,cropType,page=1,limit=20}=req.query;const filter={status:'active',isActive:true,expiresAt:{$gte:new Date()}};if(district)filter.district=new RegExp(district,'i');if(cropType)filter.cropType=new RegExp(cropType,'i');const listings=await MarketListing.find(filter).sort({createdAt:-1}).limit(Number(limit)).skip((Number(page)-1)*Number(limit));const total=await MarketListing.countDocuments(filter);res.json({success:true,listings,total});}catch(e){res.status(500).json({error:e.message});}
});
router.post('/',protect,async(req,res)=>{
  try{const{cropType,quantity,unit,price,minQty,grade,description,latitude,longitude}=req.body;if(!cropType||!quantity||!price)return res.status(400).json({error:'पीक, प्रमाण, दर आवश्यक.'});const listing=await MarketListing.create({userId:req.user._id,farmerName:req.user.name,village:req.user.village,district:req.user.district||'',mobile:req.user.mobile,cropType,quantity:Number(quantity),unit:unit||'kg',price:Number(price),minQty:Number(minQty)||1,grade:grade||'A',description:description||'',latitude:latitude||null,longitude:longitude||null});res.status(201).json({success:true,listing});}catch(e){res.status(500).json({error:e.message});}
});
router.get('/mine',protect,async(req,res)=>{
  try{const listings=await MarketListing.find({userId:req.user._id,isActive:true}).sort({createdAt:-1});res.json({success:true,listings});}catch(e){res.status(500).json({error:e.message});}
});
router.put('/:id',protect,async(req,res)=>{
  try{const listing=await MarketListing.findOneAndUpdate({_id:req.params.id,userId:req.user._id},req.body,{new:true});if(!listing)return res.status(404).json({error:'Listing नाही.'});res.json({success:true,listing});}catch(e){res.status(500).json({error:e.message});}
});
router.post('/:id/view',async(req,res)=>{
  try{await MarketListing.findByIdAndUpdate(req.params.id,{$inc:{views:1}});res.json({success:true});}catch(e){res.status(500).json({error:e.message});}
});
module.exports=router;
