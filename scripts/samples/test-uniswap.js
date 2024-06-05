var Web3 = require("web3");
const web3 = new Web3("https://ropsten.infura.io/v3/<your_token>");
const uniswap_dai_rinkeby = require("./abi/uniswap_dai_rinkeby.json");
const uniswapDaiRinkebyAddress = "0xc0fc958f7108be4060f33a699a92d3ea49b0b5f0";
var daiExchangeUniswap = new web3.eth.Contract(uniswap_dai_rinkeby, uniswapDaiRinkebyAddress);

var swapperABi = require("./abi/swapper.json");
const swapperAddress = "0x8abD769f59C3B07D39BC4ecB34A355Eb5d48d30b";
var swapper = new web3.eth.Contract(swapperABi, swapperAddress);

var ethToToken = () => {
  var resultObject = new Object();
  resultObject["srcToken"] = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  resultObject["srcAmount"] = web3.utils.toWei("0.7", "ether");
  resultObject["destToken"] = "0xaD6D458402F60fD3Bd25163575031ACDce07538D";
  resultObject["minDestAmount"] = 1;
  resultObject["callees"] = new Array();
  resultObject["values"] = new Array();
  resultObject["startIndexes"] = new Array();
  resultObject["startIndexes"].push(0);

  var data = daiExchangeUniswap.methods.ethToTokenSwapInput(resultObject["minDestAmount"], 1739591241).encodeABI();

  resultObject["exchangeData"] = data;
  resultObject["callees"].push(uniswapDaiRinkebyAddress);
  resultObject["values"].push(resultObject["srcAmount"]);
  resultObject["startIndexes"].push(data.substring(2).length / 2);

  console.log(resultObject);
};

var tokenToEth = () => {
  var resultObject = new Object();
  resultObject["srcToken"] = "0xad6d458402f60fd3bd25163575031acdce07538d";
  resultObject["srcAmount"] = "61318620165668842897";
  resultObject["destToken"] = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  resultObject["minDestAmount"] = 1;
  resultObject["callees"] = new Array();
  resultObject["values"] = new Array();
  resultObject["startIndexes"] = new Array();
  resultObject["startIndexes"].push(0);

  var data2 = swapper.methods
    .approve(resultObject["srcToken"], uniswapDaiRinkebyAddress, resultObject["srcAmount"])
    .encodeABI();

  resultObject["callees"].push(swapperAddress);
  resultObject["values"].push(0);
  resultObject["startIndexes"].push(data2.substring(2).length / 2);

  data2 = data2.substring(2);

  var data = daiExchangeUniswap.methods
    .tokenToEthSwapInput(resultObject["srcAmount"], resultObject["minDestAmount"], 1739591241)
    .encodeABI();

  data = data.substring(2);
  data = "0x" + data2 + data;

  resultObject["values"].push(0);
  resultObject["callees"].push(uniswapDaiRinkebyAddress);
  resultObject["exchangeData"] = data;
  resultObject["startIndexes"].push(data.substring(2).length / 2);
  console.log(resultObject);
};

var tokenToToken = () => {
  var resultObject = new Object();
  resultObject["srcToken"] = "0xad6d458402f60fd3bd25163575031acdce07538d";
  resultObject["srcAmount"] = "91318620165668842897";
  resultObject["destToken"] = "0x2294890606fd6587b1f96a8937186cb104274d7a";
  resultObject["minDestAmount"] = 1;
  resultObject["callees"] = new Array();
  resultObject["values"] = new Array();
  resultObject["startIndexes"] = new Array();
  resultObject["startIndexes"].push(0);

  var data2 = swapper.methods
    .approve(resultObject["srcToken"], uniswapDaiRinkebyAddress, resultObject["srcAmount"])
    .encodeABI();

  resultObject["callees"].push(swapperAddress);
  resultObject["values"].push(0);
  resultObject["startIndexes"].push(data2.substring(2).length / 2);

  data2 = data2.substring(2);

  var data = daiExchangeUniswap.methods
    .tokenToTokenSwapInput(
      resultObject["srcAmount"],
      resultObject["minDestAmount"],
      1,
      1739591241,
      resultObject["destToken"],
    )
    .encodeABI();

  data = data.substring(2);
  data = "0x" + data2 + data;

  resultObject["values"].push(0);
  resultObject["callees"].push(uniswapDaiRinkebyAddress);
  resultObject["exchangeData"] = data;
  resultObject["startIndexes"].push(data.substring(2).length / 2);
  console.log(resultObject);
};

tokenToToken();
//ethToToken();
//tokenToEth();
