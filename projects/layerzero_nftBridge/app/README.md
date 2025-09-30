# Quickstart Guide

This guide will help you set up, configure, and run the project locally.

---

## 🚀 1. Install Dependencies

Install all required packages with:

```sh
npm install
```

---

## 🏃 2. Start the Development Server

Run the project in development mode:

```sh
npm run dev
```
Or use your preferred command for your setup.

---

## ⚙️ 3. Configure Your Environment

Create a `.env` file in the project root with the following variables:

```env
VITE_PROJECT_ID=xxxxxxxxxx      # Get your project ID from https://reown.com/

CONFLUX_ORIGIN_ADDRESS=         # (Optional) Paste your deployed Conflux contract address here
BASE_BRIDGE_ADDRESS=            # (Optional) Paste your deployed Base contract address here
ARBITRUM_BRIDGE_ADDRESS =       # (Optional) Paste your deployed Arbitrum contract address here
```

- **VITE_PROJECT_ID:**  
  Obtain your project ID from [Reown](https://reown.com/) and paste it here.

- **CONFLUX_ORIGIN_ADDRESS & BASE_BRIDGE_ADDRESS & ARBITRUM_BRIDGE_ADDRESS:**  
  **Optional.**  
  If you want to use your own deployed contracts, replace these values with your contract addresses.  
  If you want to use the default deployed contracts, simply omit these lines.

---

## 📝 Notes

- If you skip `CONFLUX_ORIGIN_ADDRESS` and `BASE_BRIDGE_ADDRESS`, your app will use the default deployed contract addresses.
- For further details, refer to project documentation.

---