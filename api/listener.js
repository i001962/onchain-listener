const { GraphQLClient, gql } = require('graphql-request');
const { AirstackClient } = require('@airstack/sdk');
require('dotenv').config();

const client = new GraphQLClient('https://api.airstack.xyz/graphql', {
  headers: {
    authorization: `Bearer ${process.env.AIRSTACK_API_KEY}`,
  },
});

const airstackClient = new AirstackClient({
  apiKey: process.env.AIRSTACK_API_KEY,
});

module.exports = async (req, res) => {
  const query = gql`
    subscription {
      onNewTransaction {
        transactionHash
        from
        to
        value
        timestamp
      }
    }
  `;

  const observer = airstackClient.subscribe(query, {
    next: (data) => {
      console.log(data);
    },
    error: (error) => {
      console.error(error);
    },
  });

  res.status(200).send('Listening for transactions...');
};
