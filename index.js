const axios = require("axios");
const HOST_URL = "https://blockstream.info/api/";
const height = 680000;
let transactions = [];
let blockHash;
const transactionHistory = {};
const ancestors = {};
let currIndex = 2;

// get block hash with given height
const getBlockHash = async () => {
  try {
    const response = await axios.get(`${HOST_URL}block-height/${height}`);
    blockHash = response.data;
  } catch (e) {
    throw new Error("Failed to fetch block hash!");
  }
};

//getting all transaction for a block
const getTransactions = async () => {
  try {
    const response = await axios.get(`${HOST_URL}block/${blockHash}/txids`);
    transactions = response.data;
  } catch (e) {
    throw new Error("Failed to fetch block transactions!");
  }
};

const getTransactionInfo = async (tx) => {
  try {
    const response = await axios.get(`${HOST_URL}tx/${tx}`);
    if (response.data.status.block_hash !== blockHash) {
      while (ancestors[`${transactions[currIndex]}`]) {
        currIndex++;
        console.log(currIndex);
      }
      getTransactionInfo(transactions[currIndex]);
    }
    ancestors[`${tx}`] = {
      chain: response.data.vin.map((vin) => vin.txid),
      len: 1,
    };
    // if (ancestors[`${tx}`].len > 0)
    ancestors[`${tx}`].chain.forEach((txn) => {
      console.log(ancestors);
      if (!ancestors[`${txn}`]) {
        if (
          txn &&
          txn !=
            "0000000000000000000000000000000000000000000000000000000000000000"
        )
          getTransactionInfo(txn);
      } else {
        ancestors[`${tx}`].len += ancestors[`${txn}`].len;
      }
    });
  } catch (e) {
    console.log(e);
    throw new Error("Failed to fetch transactions info!");
  }
};

getTransactionWithHighestAncestors = () => {
  ancestors.sort(function (a, b) {
    return a.len > b.len;
  });
};
const init = async () => {
  await getBlockHash();
  await getTransactions();
  await getTransactionInfo(transactions[1]);

  console.log(ancestors, "ss");
};

init();