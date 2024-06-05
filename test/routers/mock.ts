export const SimpleSwap_simpleSwap = {
  priceRoute: {
    blockNumber: 14391963,
    network: 1,
    srcToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    srcDecimals: 6,
    srcAmount: "2000000000",
    destToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    destDecimals: 18,
    destAmount: "778367296297208647",
    bestRoute: [
      {
        percent: 100,
        swaps: [
          {
            srcToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            srcDecimals: 6,
            destToken: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            destDecimals: 18,
            swapExchanges: [
              {
                exchange: "DefiSwap",
                srcAmount: "2000000000",
                destAmount: "778367296297208647",
                percent: 100,
                poolAddresses: ["0x3Aa370AacF4CB08C7E1E7AA8E8FF9418D73C7e0F"],
                data: {
                  router: "0xF9234CB08edb93c0d4a4d4c70cC3FfD070e78e07",
                  path: ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],
                  factory: "0x9DEB29c9a4c7A88a3C0257393b7f3335338D9A9D",
                  initCode: "0x69d637e77615df9f235f642acebbdad8963ef35c5523142078c9b8f9d0ceba7e",
                  feeFactor: 10000,
                  pools: [
                    {
                      address: "0x3Aa370AacF4CB08C7E1E7AA8E8FF9418D73C7e0F",
                      fee: 30,
                      direction: true,
                    },
                  ],
                  gasUSD: "16.840917",
                },
              },
            ],
          },
        ],
      },
    ],
    gasCostUSD: "37.723653",
    gasCost: "201600",
    side: "SELL",
    tokenTransferProxy: "0x216b4b4ba9f3e719726886d34a177484278bfcae",
    contractAddress: "0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57",
    contractMethod: "simpleSwap",
    partnerFee: 0,
    srcUSD: "1998.7660000000",
    destUSD: "1995.1931097696",
    partner: "paraswap.io",
    maxImpactReached: false,
    hmac: "7f8e77a2ae22b4336402a7687093388e016ed704",
  },
};
