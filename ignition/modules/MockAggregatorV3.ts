import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { DECIMALS, INITIAL_ANSWER } from "../../helper-hardhat-config";

const MockV3Aggregator = buildModule("MockV3Aggregator", (m) => {
  const deployer = m.getAccount(0);
  const mockV3Aggregator = m.contract(
    "MockV3Aggregator",
    [DECIMALS, INITIAL_ANSWER],
    {
      from: deployer,
    }
  );
  return { mockV3Aggregator };
});

export default MockV3Aggregator;
