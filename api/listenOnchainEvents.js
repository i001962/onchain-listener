const { fetchQuery } = require('@airstack/node');
require('dotenv').config();

const query = `
query MyQuery {
  Wallet(input: {identity: "vitalik.eth", blockchain: ethereum}) {
    socials {
      dappName
      profileName
    }
    addresses
  }
}
`;

module.exports = async (req, res) => {
  try {
    const { data, error } = await fetchQuery(query, {
      apiKey: process.env.AIRSTACK_API_KEY,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log(data);

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
