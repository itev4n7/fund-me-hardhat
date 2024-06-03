# FundMe Hardhat Project

for localhost:
```shell
yarn hardhat node
```
```shell
yarn hardhat ignition deploy ./ignition/modules/MockAggregatorV3.ts --network localhost
```
```shell
yarn hardhat ignition deploy ./ignition/modules/FundMe.ts --network localhost
```

for sepolia:
```shell
yarn hardhat ignition deploy ./ignition/modules/FundMe.ts --network sepolia
```

alternative verify:
```shell
yarn hardhat verify --network sepolia contract_address price_feed_address
```
or
```shell
yarn hardhat ignition verify chain-11155111
```

to run hardhat script:
```shell
yarn hardhat run scripts/fund.ts --network localhost
```
```shell
yarn hardhat run scripts/withdraw.ts --network localhost
```
