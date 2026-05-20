const express = require('express'); const router = express.Router();
const { Crop, User } = require('../models');
const { protect } = require('../middleware/auth');
const { blockchain } = require('../utils/index');
router.use(protect);
router.post('/', async (req,res)=>{
  try{
    const{cropType,variety,sowingDate,harvestDate,areaAcres,fertilizer,pesticide,irrigation,expectedYield,landId}=req.body;
    if(!cropType||!sowingDate)return res.status(400).json({error:'पीक प्रकार आणि पेरणी तारीख आवश्यक.'});
    const bc=await blockchain.executeContract(req.user._id,'CropNFT','mintCrop',{cropType,sowingDate});
    const nftTokenId='CROP-NFT-'+Date.now();
    const crop=await Crop.create({userId:req.user._id,landId:landId||null,farmerName:req.user.name,cropType,variety:variety||'',sowingDate:new Date(sowingDate),harvestDate:harvestDate?new Date(harvestDate):null,areaAcres:Number(areaAcres)||0,fertilizer:fertilizer||'',pesticide:pesticide||'',irrigation:irrigation||'',expectedYield:Number(expectedYield)||0,nftTokenId,txHash:bc.txHash});
    await User.findByIdAndUpdate(req.user._id,{$inc:{totalCrops:1}});
    res.status(201).json({success:true,crop});
  }catch(e){res.status(500).json({error:e.message});}
});
router.get('/', async(req,res)=>{
  try{const crops=await Crop.find({userId:req.user._id,isActive:true}).populate('landId','surveyNumber village').sort({createdAt:-1});res.json({success:true,crops,total:crops.length});}catch(e){res.status(500).json({error:e.message});}
});
router.put('/:id', async(req,res)=>{
  try{const crop=await Crop.findOneAndUpdate({_id:req.params.id,userId:req.user._id},req.body,{new:true});if(!crop)return res.status(404).json({error:'पीक नाही.'});res.json({success:true,crop});}catch(e){res.status(500).json({error:e.message});}
});
router.delete('/:id', async(req,res)=>{
  try{await Crop.findOneAndUpdate({_id:req.params.id,userId:req.user._id},{isActive:false});await User.findByIdAndUpdate(req.user._id,{$inc:{totalCrops:-1}});res.json({success:true});}catch(e){res.status(500).json({error:e.message});}
});
module.exports = router;
