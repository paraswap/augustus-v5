var Web3 = require("web3");
const web3 = new Web3("https://ropsten.infura.io/v3/<your_token>");
const kyber_proxy_ropsten = require("./abi/kyber_proxy_ropsten.json");
const kyberProxyAddress = "0x818e6fecd516ecc3849daf6845e3ec868087b755";
var kyberProxy = new web3.eth.Contract(kyber_proxy_ropsten, kyberProxyAddress);

var swapperABi = require("./abi/swapper.json");
const swapperAddress = "0x8abD769f59C3B07D39BC4ecB34A355Eb5d48d30b";
var swapper = new web3.eth.Contract(swapperABi, swapperAddress);

var ethToToken = () => {
  var resultObject = new Object();
  resultObject["srcToken"] = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  resultObject["srcAmount"] = web3.utils.toWei("1", "ether");
  resultObject["destToken"] = "0xaD6D458402F60fD3Bd25163575031ACDce07538D";
  resultObject["destAddr"] = swapperAddress;
  resultObject["minDestAmount"] = 1;
  resultObject["callees"] = new Array();
  resultObject["callees"].push(kyberProxyAddress);

  var data = kyberProxy.methods
    .tradeWithHint(
      resultObject["srcToken"],
      resultObject["srcAmount"],
      resultObject["destToken"],
      resultObject["destAddr"],
      "57896044618658097711785492504343953926634992332820282019728792003956564819968",
      "1",
      "0x0000000000000000000000000000000000000000",
      "0x",
    )
    .encodeABI();

  resultObject["exchangeData"] = data;
  resultObject["startIndexes"] = new Array();
  resultObject["startIndexes"].push(0);
  resultObject["startIndexes"].push(data.substring(2).length / 2);
  resultObject["values"] = new Array();
  resultObject["values"].push(web3.utils.toWei("1", "ether"));

  console.log(resultObject);
};

var tokenToEth = () => {
  var resultObject = new Object();
  resultObject["srcToken"] = "0xad6d458402f60fd3bd25163575031acdce07538d";
  resultObject["srcAmount"] = "59362330000000000000";
  resultObject["destToken"] = "0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6";
  resultObject["destAddr"] = swapperAddress;
  resultObject["minDestAmount"] = 1;
  resultObject["callees"] = new Array();
  resultObject["startIndexes"] = new Array();
  resultObject["startIndexes"].push(0);
  resultObject["values"] = new Array();

  var data2 = swapper.methods
    .approve(resultObject["srcToken"], kyberProxyAddress, resultObject["srcAmount"])
    .encodeABI();

  resultObject["values"].push(0);
  resultObject["callees"].push(swapperAddress);
  resultObject["startIndexes"].push(data2.substring(2).length / 2);

  data2 = data2.substring(2);

  var data = kyberProxy.methods
    .tradeWithHint(
      resultObject["srcToken"],
      resultObject["srcAmount"],
      resultObject["destToken"],
      resultObject["destAddr"],
      "57896044618658097711785492504343953926634992332820282019728792003956564819968",
      "1",
      "0x0000000000000000000000000000000000000000",
      "0x",
    )
    .encodeABI();

  data = data.substring(2);
  data = "0x" + data2 + data;

  resultObject["values"].push(0);
  resultObject["callees"].push(kyberProxyAddress);
  resultObject["exchangeData"] = data;
  resultObject["startIndexes"].push(data.substring(2).length / 2);

  console.log(resultObject);
};

//ethToToken();
tokenToEth();
