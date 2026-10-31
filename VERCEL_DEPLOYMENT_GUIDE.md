# 🚀 KrushiChain — Vercel Deployment Guide

या गाईडमध्ये KrushiChain प्रोजेक्ट **Vercel** वर कसा Deploy करायचा, याची सोपी आणि खात्रीशीर पद्धत दिली आहे.

---

## 🎯 पद्धत १: संपूर्ण प्रोजेक्ट थेट Vercel वर (Fullstack Deployment)

प्रोजेक्टच्या मुख्य फोल्डरमध्ये आपण `vercel.json` आधीच कॉन्फिगर करून ठेवले आहे, जे **Frontend (React)** आणि **Backend (Node/Express Serverless)** दोन्ही एकाच ठिकाणी चालवते.

### पायऱ्या:
1. तुमचे बदल Git वर कमिट व पुश करा:
   ```bash
   git add .
   git commit -m "feat: MST Chain integration & Vercel deployment ready"
   git push origin main
   ```
2. [vercel.com](https://vercel.com) वर जाऊन लॉगिन करा.
3. **"Add New..."** ➔ **"Project"** निवडा.
4. तुमचे **KrushiChain** GitHub Repository सिलेक्ट करा.
5. **Root Directory:** `./` (Default राहू द्या).
6. **Environment Variables** (खालील व्हेरिएबल्स Vercel Settings मध्ये जोडा):

| Variable Name | Value |
|---|---|
| `MONGO_URI` | `mongodb+srv://...` (तुमचा MongoDB Atlas connection string) |
| `JWT_SECRET` | `krushichain_pilot_secret_2024` |
| `BLOCKCHAIN_NETWORK` | `mstTestnet` (किंवा `mstMainnet`) |
| `BLOCKCHAIN_PRIVATE_KEY` | `0xccc369e2ccc14e1fb7e547d1178bdf5c1d23b5f2e866d837ab309d5a64fcef4a` |
| `CONTRACT_ADDRESS` | `0x839A088dea854A031b9e6F0047dbF5860D5CdED6` |
| `VITE_CONTRACT_ADDRESS` | `0x839A088dea854A031b9e6F0047dbF5860D5CdED6` |
| `VITE_MST_TESTNET_CHAIN_ID` | `91562037` |
| `VITE_MST_TESTNET_RPC_URL` | `https://testnetrpc.mstblockchain.com` |
| `VITE_MST_MAINNET_CHAIN_ID` | `4646` |
| `VITE_MST_MAINNET_RPC_URL` | `https://mariorpc.mstblockchain.com` |

7. **"Deploy"** बटनावर क्लिक करा! अवघ्या १ ते २ मिनिटांत तुमची साईट लाईव्ह होईल.

---

## ⚡ पद्धत २: फक्त Frontend Vercel वर (Recommended for Production & Socket.IO)

जर तुम्हाला रिअल-टाइम सॉकेट चॅट (Socket.IO) अविरत चालवायचे असेल, तर Frontend Vercel वर आणि Backend मोफत Render/Railway वर ठेवणे ही इंडस्ट्री-स्टँडर्ड पद्धत आहे:

1. Vercel वर **Root Directory:** `frontend` निवडा.
2. `frontend/vercel.json` आधीच तयार आहे (SPA Routing साठी).
3. Vercel मध्ये फक्त हे एक व्हेरिएबल जोडा:
   * `VITE_API_URL` = `https://your-backend-service.onrender.com` (किंवा तुमचे बॅकएंड URL)
   * `VITE_CONTRACT_ADDRESS` = `0x839A088dea854A031b9e6F0047dbF5860D5CdED6`

---

## 🔒 महत्त्वाचे: MongoDB Atlas IP Whitelist

Vercel हे क्लाउडवर चालत असल्याने, तुमच्या MongoDB Atlas मध्ये सर्व IP पत्त्यांना परवानगी द्या:
1. [MongoDB Atlas](https://cloud.mongodb.com/) वर जा.
2. **Network Access** ➔ **IP Access List** वर जा.
3. **"Add IP Address"** वर क्लिक करून **"Allow Access from Anywhere"** (`0.0.0.0/0`) जोडा.
