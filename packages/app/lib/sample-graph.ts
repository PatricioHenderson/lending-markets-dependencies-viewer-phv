import type { DependencyGraph } from "@/types/graph";

// To update the sample graph: paste a new graph JSON between the backticks below,
// replacing everything currently there. No other file needs to change.
export const SAMPLE_GRAPH_JSON = `
{
  "root": "market:ethereum-1:aethusdc:aethusdc",
  "chainId": 1,
  "nodes": [
    {
      "id": "market:ethereum-1:aethusdc:aethusdc",
      "type": "market",
      "label": "aEthUSDC",
      "provenance": "api",
      "marketSupply": {
        "suppliedAmount": "2140348761.604827",
        "supplyCapAmount": "2500000000",
        "supplyCapUsedPct": 85.61395046419308,
        "suppliedUsd": 2139992800.2022846
      },
      "address": "0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c"
    },
    {
      "id": "protocol:ethereum-1:aave-v3",
      "type": "protocol",
      "label": "Aave V3",
      "provenance": "api"
    },
    {
      "id": "primitive-token:ethereum-1:usdc",
      "type": "primitive_token",
      "label": "USDC",
      "provenance": "api",
      "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "supplyMetrics": {
        "suppliedAmount": "2140348761.604827",
        "supplyCapAmount": "2500000000",
        "supplyCapUsedPct": 85.61395046419308,
        "suppliedUsd": 2139992800.2022846,
        "shareOfCollateralPct": 13.265708021881418,
        "maxLtvPct": 75,
        "liquidationThresholdPct": 78,
        "liquidationBonusPct": 4.5,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "wrapper:ethereum-1:weth",
      "type": "wrapper",
      "label": "WETH",
      "provenance": "curated",
      "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "supplyMetrics": {
        "suppliedAmount": "2007501.701401382342561712",
        "supplyCapAmount": "2700000",
        "supplyCapUsedPct": 74.35191486671788,
        "suppliedUsd": 3638609280.3005543,
        "shareOfCollateralPct": 22.55555640823305,
        "maxLtvPct": 80.5,
        "liquidationThresholdPct": 83,
        "liquidationBonusPct": 5,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "primitive-token:ethereum-1:eth",
      "type": "primitive_token",
      "label": "ETH",
      "provenance": "curated"
    },
    {
      "id": "primitive-token:ethereum-1:usdt",
      "type": "primitive_token",
      "label": "USDT",
      "provenance": "curated",
      "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "supplyMetrics": {
        "suppliedAmount": "2784008064.121996",
        "supplyCapAmount": "3480000000",
        "supplyCapUsedPct": 80.00023172764355,
        "suppliedUsd": 2782069447.946625,
        "shareOfCollateralPct": 17.24590895332366,
        "maxLtvPct": 75,
        "liquidationThresholdPct": 78,
        "liquidationBonusPct": 4.5,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "wrapper:ethereum-1:wbtc",
      "type": "wrapper",
      "label": "WBTC",
      "provenance": "curated",
      "address": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      "supplyMetrics": {
        "suppliedAmount": "32741.83945385",
        "supplyCapAmount": "38200",
        "supplyCapUsedPct": 85.71162160693717,
        "suppliedUsd": 2106699396.4476705,
        "shareOfCollateralPct": 13.059323882074228,
        "maxLtvPct": 73,
        "liquidationThresholdPct": 78,
        "liquidationBonusPct": 5,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "primitive-token:ethereum-1:btc",
      "type": "primitive_token",
      "label": "BTC",
      "provenance": "curated"
    },
    {
      "id": "protocol:ethereum-1:bitgo",
      "type": "protocol",
      "label": "BitGo",
      "provenance": "curated"
    },
    {
      "id": "protocol:ethereum-1:wbtc-dao",
      "type": "protocol",
      "label": "WBTC DAO",
      "provenance": "curated"
    },
    {
      "id": "wrapper:ethereum-1:weeth",
      "type": "wrapper",
      "label": "weETH",
      "provenance": "curated",
      "address": "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
      "supplyMetrics": {
        "suppliedAmount": "965756.035564934203589943",
        "supplyCapAmount": "1100000",
        "supplyCapUsedPct": 87.79600323317584,
        "suppliedUsd": 1923647217.7531736,
        "shareOfCollateralPct": 11.924592608632132,
        "maxLtvPct": 77.5,
        "liquidationThresholdPct": 80,
        "liquidationBonusPct": 7,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "wrapper:ethereum-1:eeth",
      "type": "wrapper",
      "label": "eETH",
      "provenance": "curated",
      "address": "0x35fa164735182de50811e8e2e824cfb9b6118ac2"
    },
    {
      "id": "protocol:ethereum-1:ether-fi",
      "type": "protocol",
      "label": "Ether.fi",
      "provenance": "curated"
    },
    {
      "id": "wrapper:ethereum-1:wsteth",
      "type": "wrapper",
      "label": "wstETH",
      "provenance": "curated",
      "address": "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
      "supplyMetrics": {
        "suppliedAmount": "813436.664063633662730875",
        "supplyCapAmount": "1000000",
        "supplyCapUsedPct": 81.34366640636337,
        "suppliedUsd": 1826923916.836859,
        "shareOfCollateralPct": 11.325009718097585,
        "maxLtvPct": 78.5,
        "liquidationThresholdPct": 81,
        "liquidationBonusPct": 6,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "wrapper:ethereum-1:steth",
      "type": "wrapper",
      "label": "stETH",
      "provenance": "curated",
      "address": "0xae7ab96520de3a18e5e111b5eaab095312d7fe84"
    },
    {
      "id": "protocol:ethereum-1:lido",
      "type": "protocol",
      "label": "Lido",
      "provenance": "curated"
    },
    {
      "id": "wrapper:ethereum-1:cbbtc",
      "type": "wrapper",
      "label": "cbBTC",
      "provenance": "curated",
      "address": "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
      "supplyMetrics": {
        "suppliedAmount": "19592.64687056",
        "supplyCapAmount": "22800",
        "supplyCapUsedPct": 85.93266171298245,
        "suppliedUsd": 1261064610.6678667,
        "shareOfCollateralPct": 7.817276263857602,
        "maxLtvPct": 73,
        "liquidationThresholdPct": 78,
        "liquidationBonusPct": 7.5,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "protocol:ethereum-1:coinbase",
      "type": "protocol",
      "label": "Coinbase",
      "provenance": "curated"
    },
    {
      "id": "wrapper:ethereum-1:tbtc",
      "type": "wrapper",
      "label": "tBTC",
      "provenance": "curated",
      "address": "0x18084fbA666a33d37592fA2633fD49a74DD93a88",
      "supplyMetrics": {
        "suppliedAmount": "2015.306705483552531038",
        "supplyCapAmount": "2500",
        "supplyCapUsedPct": 80.61226821934211,
        "suppliedUsd": 129713559.51633695,
        "shareOfCollateralPct": 0.8040878487348224,
        "maxLtvPct": 73,
        "liquidationThresholdPct": 78,
        "liquidationBonusPct": 7.5,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "protocol:ethereum-1:threshold-network",
      "type": "protocol",
      "label": "Threshold Network",
      "provenance": "curated"
    },
    {
      "id": "wrapper:ethereum-1:lbtc",
      "type": "wrapper",
      "label": "LBTC",
      "provenance": "curated",
      "address": "0x8236a87084f8B84306f72007F36F2618A5634494",
      "supplyMetrics": {
        "suppliedAmount": "1997.12661246",
        "supplyCapAmount": "2690",
        "supplyCapUsedPct": 74.24262499851301,
        "suppliedUsd": 129121678.20134543,
        "shareOfCollateralPct": 0.8004188061532106,
        "maxLtvPct": 70,
        "liquidationThresholdPct": 75,
        "liquidationBonusPct": 8.5,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "protocol:ethereum-1:lombard",
      "type": "protocol",
      "label": "Lombard",
      "provenance": "curated"
    },
    {
      "id": "primitive-token:ethereum-1:aave",
      "type": "primitive_token",
      "label": "AAVE",
      "provenance": "curated",
      "address": "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      "supplyMetrics": {
        "suppliedAmount": "806404.316878377211936992",
        "supplyCapAmount": "1000000",
        "supplyCapUsedPct": 80.64043168783772,
        "suppliedUsd": 78972932.3423643,
        "shareOfCollateralPct": 0.48954924614072165,
        "maxLtvPct": 69,
        "liquidationThresholdPct": 76,
        "liquidationBonusPct": 7.5,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "wrapper:ethereum-1:reth",
      "type": "wrapper",
      "label": "rETH",
      "provenance": "curated",
      "address": "0xae78736Cd615f374D3085123A210448E74Fc6393",
      "supplyMetrics": {
        "suppliedAmount": "34428.220932228269370089",
        "supplyCapAmount": "49000",
        "supplyCapUsedPct": 70.26167537189444,
        "suppliedUsd": 72833130.95260462,
        "shareOfCollateralPct": 0.4514889253110466,
        "maxLtvPct": 75,
        "liquidationThresholdPct": 79,
        "liquidationBonusPct": 7.5,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "protocol:ethereum-1:rocket-pool",
      "type": "protocol",
      "label": "Rocket Pool",
      "provenance": "curated"
    },
    {
      "id": "wrapper:ethereum-1:fbtc",
      "type": "wrapper",
      "label": "FBTC",
      "provenance": "curated",
      "address": "0xC96dE26018A54D51c097160568752c4E3BD6C364",
      "supplyMetrics": {
        "suppliedAmount": "174.6260004",
        "supplyCapAmount": "175",
        "supplyCapUsedPct": 99.78628594285715,
        "suppliedUsd": 11239658.97317367,
        "shareOfCollateralPct": 0.06967408216959767,
        "maxLtvPct": 73,
        "liquidationThresholdPct": 78,
        "liquidationBonusPct": 7.5,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "protocol:ethereum-1:function",
      "type": "protocol",
      "label": "Function",
      "provenance": "curated"
    },
    {
      "id": "primitive-token:ethereum-1:pyusd",
      "type": "primitive_token",
      "label": "PYUSD",
      "provenance": "curated",
      "address": "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",
      "supplyMetrics": {
        "suppliedAmount": "11131797.117575",
        "supplyCapAmount": "21000000",
        "supplyCapUsedPct": 53.00855770273809,
        "suppliedUsd": 11130450.615395658,
        "shareOfCollateralPct": 0.06899710503785436,
        "maxLtvPct": 75,
        "liquidationThresholdPct": 78,
        "liquidationBonusPct": 7.5,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "wrapper:ethereum-1:cbeth",
      "type": "wrapper",
      "label": "cbETH",
      "provenance": "curated",
      "address": "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704",
      "supplyMetrics": {
        "suppliedAmount": "3890.825578292916625054",
        "supplyCapAmount": "9000",
        "supplyCapUsedPct": 43.23139531436574,
        "suppliedUsd": 8001278.330004161,
        "shareOfCollateralPct": 0.04959952300662363,
        "maxLtvPct": 75,
        "liquidationThresholdPct": 79,
        "liquidationBonusPct": 7.5,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "market:ethereum-1:syrupusdt",
      "type": "market",
      "label": "syrupUSDT",
      "provenance": "curated",
      "address": "0x356B8d89c1e1239Cbbb9dE4815c39A1474d5BA7D",
      "supplyMetrics": {
        "suppliedAmount": "5271310.240099",
        "supplyCapAmount": "27200000",
        "supplyCapUsedPct": 19.3798170591875,
        "suppliedUsd": 5975988.165075252,
        "shareOfCollateralPct": 0.03704485086707468,
        "maxLtvPct": 0.05,
        "liquidationThresholdPct": 0.1,
        "liquidationBonusPct": 6,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "protocol:ethereum-1:maple",
      "type": "protocol",
      "label": "Maple",
      "provenance": "curated"
    },
    {
      "id": "wrapper:ethereum-1:ebtc",
      "type": "wrapper",
      "label": "eBTC",
      "provenance": "curated",
      "address": "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642",
      "supplyMetrics": {
        "suppliedAmount": "81.46623159",
        "supplyCapAmount": "134",
        "supplyCapUsedPct": 60.79569521641791,
        "suppliedUsd": 5263202.482417196,
        "shareOfCollateralPct": 0.03262632817511731,
        "maxLtvPct": 67,
        "liquidationThresholdPct": 72,
        "liquidationBonusPct": 10,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "wrapper:ethereum-1:btc-b",
      "type": "wrapper",
      "label": "BTC.b",
      "provenance": "curated",
      "address": "0xB0F70C0bD6FD87dbEb7C10dC692a2a6106817072",
      "supplyMetrics": {
        "suppliedAmount": "7.51887041",
        "supplyCapAmount": "10",
        "supplyCapUsedPct": 75.18870410000001,
        "suppliedUsd": 483945.913428173,
        "shareOfCollateralPct": 0.002999956441588962,
        "maxLtvPct": 73,
        "liquidationThresholdPct": 78,
        "liquidationBonusPct": 7.5,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "protocol:ethereum-1:avalanche-bridge",
      "type": "protocol",
      "label": "Avalanche Bridge",
      "provenance": "curated"
    },
    {
      "id": "position:ethereum-1:pt-susde-5feb2026",
      "type": "position",
      "label": "PT-sUSDE-5FEB2026",
      "provenance": "curated",
      "address": "0xE8483517077afa11A9B07f849cee2552f040d7b2",
      "supplyMetrics": {
        "suppliedAmount": "20388.243093646729930744",
        "supplyCapAmount": "1",
        "supplyCapUsedPct": 2038824.3093646732,
        "suppliedUsd": 20374.0459444509,
        "shareOfCollateralPct": 0.00012629768880434306,
        "maxLtvPct": 0.05,
        "liquidationThresholdPct": 0.1,
        "liquidationBonusPct": 7.5,
        "isFrozen": false,
        "isPaused": false
      }
    },
    {
      "id": "wrapper:ethereum-1:susde",
      "type": "wrapper",
      "label": "sUSDe",
      "provenance": "curated"
    },
    {
      "id": "wrapper:ethereum-1:usde",
      "type": "wrapper",
      "label": "USDe",
      "provenance": "curated",
      "address": "0x4c9edd5852cd905f086c759e8383e09bff1e68b3"
    },
    {
      "id": "protocol:ethereum-1:ethena",
      "type": "protocol",
      "label": "Ethena",
      "provenance": "curated"
    },
    {
      "id": "protocol:ethereum-1:pendle",
      "type": "protocol",
      "label": "Pendle",
      "provenance": "curated"
    },
    {
      "id": "position:ethereum-1:pt-usde-5feb2026",
      "type": "position",
      "label": "PT-USDe-5FEB2026",
      "provenance": "curated",
      "address": "0x1F84a51296691320478c98b8d77f2Bbd17D34350",
      "supplyMetrics": {
        "suppliedAmount": "1803.847525772159785781",
        "supplyCapAmount": "1",
        "supplyCapUsedPct": 180384.752577216,
        "suppliedUsd": 1802.5914345860635,
        "shareOfCollateralPct": 0.000011174173881193762,
        "maxLtvPct": 0.05,
        "liquidationThresholdPct": 0.1,
        "liquidationBonusPct": 7.5,
        "isFrozen": false,
        "isPaused": false
      }
    }
  ],
  "edges": [
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "protocol:ethereum-1:aave-v3",
      "type": "protocol",
      "provenance": "api"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "primitive-token:ethereum-1:usdc",
      "type": "loan",
      "provenance": "api"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "wrapper:ethereum-1:weth",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:weth",
      "to": "primitive-token:ethereum-1:eth",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "primitive-token:ethereum-1:usdt",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "primitive-token:ethereum-1:usdc",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "wrapper:ethereum-1:wbtc",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:wbtc",
      "to": "primitive-token:ethereum-1:btc",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:wbtc",
      "to": "protocol:ethereum-1:bitgo",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:wbtc",
      "to": "protocol:ethereum-1:wbtc-dao",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "wrapper:ethereum-1:weeth",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:weeth",
      "to": "wrapper:ethereum-1:eeth",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:eeth",
      "to": "primitive-token:ethereum-1:eth",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:eeth",
      "to": "protocol:ethereum-1:ether-fi",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:weeth",
      "to": "protocol:ethereum-1:ether-fi",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "wrapper:ethereum-1:wsteth",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:wsteth",
      "to": "wrapper:ethereum-1:steth",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:steth",
      "to": "primitive-token:ethereum-1:eth",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:steth",
      "to": "protocol:ethereum-1:lido",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:wsteth",
      "to": "protocol:ethereum-1:lido",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "wrapper:ethereum-1:cbbtc",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:cbbtc",
      "to": "primitive-token:ethereum-1:btc",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:cbbtc",
      "to": "protocol:ethereum-1:coinbase",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "wrapper:ethereum-1:tbtc",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:tbtc",
      "to": "primitive-token:ethereum-1:btc",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:tbtc",
      "to": "protocol:ethereum-1:threshold-network",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "wrapper:ethereum-1:lbtc",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:lbtc",
      "to": "primitive-token:ethereum-1:btc",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:lbtc",
      "to": "protocol:ethereum-1:lombard",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "primitive-token:ethereum-1:aave",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "wrapper:ethereum-1:reth",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:reth",
      "to": "primitive-token:ethereum-1:eth",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:reth",
      "to": "protocol:ethereum-1:rocket-pool",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "wrapper:ethereum-1:fbtc",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:fbtc",
      "to": "primitive-token:ethereum-1:btc",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:fbtc",
      "to": "protocol:ethereum-1:function",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "primitive-token:ethereum-1:pyusd",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "wrapper:ethereum-1:cbeth",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:cbeth",
      "to": "primitive-token:ethereum-1:eth",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:cbeth",
      "to": "protocol:ethereum-1:coinbase",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "market:ethereum-1:syrupusdt",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:syrupusdt",
      "to": "primitive-token:ethereum-1:usdt",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:syrupusdt",
      "to": "protocol:ethereum-1:maple",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "wrapper:ethereum-1:ebtc",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:ebtc",
      "to": "primitive-token:ethereum-1:btc",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:ebtc",
      "to": "protocol:ethereum-1:ether-fi",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "wrapper:ethereum-1:btc-b",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:btc-b",
      "to": "primitive-token:ethereum-1:btc",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:btc-b",
      "to": "protocol:ethereum-1:avalanche-bridge",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "position:ethereum-1:pt-susde-5feb2026",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "position:ethereum-1:pt-susde-5feb2026",
      "to": "wrapper:ethereum-1:susde",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:susde",
      "to": "wrapper:ethereum-1:usde",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:usde",
      "to": "protocol:ethereum-1:ethena",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "wrapper:ethereum-1:susde",
      "to": "protocol:ethereum-1:ethena",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "position:ethereum-1:pt-susde-5feb2026",
      "to": "protocol:ethereum-1:pendle",
      "type": "protocol",
      "provenance": "curated"
    },
    {
      "from": "market:ethereum-1:aethusdc:aethusdc",
      "to": "position:ethereum-1:pt-usde-5feb2026",
      "type": "collateral",
      "provenance": "curated"
    },
    {
      "from": "position:ethereum-1:pt-usde-5feb2026",
      "to": "wrapper:ethereum-1:usde",
      "type": "underlying",
      "provenance": "curated"
    },
    {
      "from": "position:ethereum-1:pt-usde-5feb2026",
      "to": "protocol:ethereum-1:pendle",
      "type": "protocol",
      "provenance": "curated"
    }
  ]
}
`.trim();

export const SAMPLE_GRAPH: DependencyGraph = JSON.parse(SAMPLE_GRAPH_JSON);
