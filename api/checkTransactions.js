const { fetchQuery } = require('@airstack/node');
require('dotenv').config();
const axios = require('axios');

const query = `
query MyQuery {
  Ethereum: TokenTransfers(
    input: {
      filter: {from: {_eq: "vitalik.eth"}},
      blockchain: ethereum,
      order: {blockTimestamp: DESC},
      limit: 1
    }
  ) {
    TokenTransfer {
      blockchain
      transactionHash
      blockTimestamp
      from {
        identity
      }
      to {
        identity
      }
      amount
      formattedAmount
      tokenAddress
      tokenId
    }
  }
}
`;

let lastTransactionHash = null;

const checkTransactions = async () => {
  try {
    const { data, error } = await fetchQuery(query, {
      apiKey: process.env.AIRSTACK_API_KEY,
    });

    if (error) {
      throw new Error(error.message);
    }

    const transactions = data.Wallet.transactions;
    if (transactions && transactions.length > 0) {
      const latestTransaction = transactions[0];
      if (latestTransaction.hash !== lastTransactionHash) {
        lastTransactionHash = latestTransaction.hash;
        console.log("New transaction found:", latestTransaction);

        // Call the API with the new transaction details
        await sendNotification(latestTransaction);
      } else {
        console.log("No new transactions found.");
      }
    }
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
  }
};

const sendNotification = async (transaction) => {
  const url = 'https://api.warpcast.com/v2/ext-send-direct-cast';
  const WCapiKey = process.env.WC_API_KEY;
  const recipientFid = 4163; // Kmac's or castfarerFID 196892
  const idempotencyKey = 'ed3d9b95-5eed-475f-9c7d-58bdc3b9ac00'; // Todo: generate a unique idempotency key

  const message = `New transaction detected: ${JSON.stringify(transaction)}`;

  try {
    const response = await axios.put(
      url,
      {
        recipientFid,
        message,
        idempotencyKey,
      },
      {
        headers: {
          'Authorization': `Bearer ${WCapiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Notification sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending notification:', error.response?.data || error.message);
  }
};

// Schedule the function to run every minute
setInterval(checkTransactions, 60000);

module.exports = (req, res) => {
  res.status(200).send('Transaction check bot is running.');
};

// To start checking immediately when the script runs
checkTransactions();
