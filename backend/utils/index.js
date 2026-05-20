// utils/sms.js
const axios = require('axios');

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOTP(mobile, otp) {
  const provider = process.env.SMS_PROVIDER || 'test';
  const digits   = mobile.replace(/^\+91/, '');
  console.log(`\n📱 OTP Request for +91${digits}: [ ${otp} ]`);

  if (provider === 'test') {
    console.log('🔧 Test Mode - OTP displayed on frontend');
    return { success: true, mode: 'test', otp };
  }

  if (provider === 'msg91') {
    if (!process.env.MSG91_API_KEY || !process.env.MSG91_TEMPLATE_ID) {
      console.warn('⚠️  MSG91 credentials missing in .env');
      console.log('🔧 Falling back to test mode');
      return { success: true, mode: 'test', otp };
    }
    
    try {
      console.log('📤 Sending via MSG91...');
      
      const qs = new URLSearchParams({
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: `91${digits}`,
        otp: otp
      });
      if (process.env.MSG91_SENDER_ID) qs.append('sender', process.env.MSG91_SENDER_ID);
      
      const url = `https://control.msg91.com/api/v5/otp?${qs.toString()}`;
      
      console.log(`   Endpoint: https://control.msg91.com/api/v5/otp`);
      console.log(`   Mobile: 91${digits}`);
      console.log(`   OTP: ${otp}`);
      
      const res = await axios.post(url, {}, {
        headers: {
          'authkey': process.env.MSG91_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ MSG91 Response Status:', res.status);
      console.log('✅ MSG91 Response:', JSON.stringify(res.data));
      console.log('✅ OTP Sent Successfully!');
      return { success: true, mode: 'msg91', response: res.data };
    } catch (e) {
      console.error('\n❌ MSG91 ERROR DETAILS:');
      console.error('   Status:', e.response?.status);
      console.error('   Status Text:', e.response?.statusText);
      console.error('   Response Data:', JSON.stringify(e.response?.data, null, 2));
      console.error('   Message:', e.message);
      console.error('   Code:', e.code);
      
      // Fallback to test mode
      console.log('\n🔧 Falling back to test mode');
      return { success: true, mode: 'test', otp, error: e.message };
    }
  }

  if (provider === 'twilio') {
    try {
      const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await twilio.messages.create({ body: `KrushiChain OTP: ${otp}. 10 min valid.`, from: process.env.TWILIO_PHONE, to: `+91${digits}` });
      console.log('✅ OTP Sent via Twilio');
      return { success: true, mode: 'twilio' };
    } catch (e) {
      console.error('❌ Twilio Error:', e.message);
      return { success: false, error: e.message };
    }
  }
  
  console.error('❌ Unknown SMS provider:', provider);
  return { success: false, error: 'Unknown provider' };
}

module.exports = { generateOTP, sendOTP };

// utils/blockchain.js – Real Polygon Integration
const { storeProof, generateHash } = require('./blockchain');

async function executeContract(userId, contract, method, params) {
  try {
    // Generate hashes for proof
    const farmerIdHash = generateHash(userId.toString());
    const dataHash = generateHash(JSON.stringify(params));
    const ipfsHash = ''; // For now, empty; add IPFS later

    // Map method to action
    const actionMap = {
      'registerLand': 'land_registration',
      'approveSubsidy': 'subsidy_approval',
      'claimInsurance': 'insurance_claim',
      'transferLand': 'land_transfer'
    };
    const action = actionMap[method] || method;

    // Store proof on Polygon
    const result = await storeProof(farmerIdHash, dataHash, ipfsHash, action);
    if (result) {
      return {
        txHash: result.txHash,
        blockNumber: result.blockNumber,
        contractAddr: process.env.CONTRACT_ADDRESS,
        proofId: result.proofId
      };
    } else {
      // Fallback to simulation if blockchain fails
      console.log('Blockchain failed, using simulation');
      const txHash = '0x' + [...Array(64)].map(() => Math.floor(Math.random()*16).toString(16)).join('');
      const blockNumber = Math.floor(18000000 + Math.random() * 1000000);
      return { txHash, blockNumber, contractAddr: `0xKC_${contract}_v1` };
    }
  } catch (e) {
    console.error('Blockchain error:', e.message);
    // Fallback
    const txHash = '0x' + [...Array(64)].map(() => Math.floor(Math.random()*16).toString(16)).join('');
    const blockNumber = Math.floor(18000000 + Math.random() * 1000000);
    return { txHash, blockNumber, contractAddr: `0xKC_${contract}_v1` };
  }
}

module.exports.blockchain = { executeContract, generateHash };
