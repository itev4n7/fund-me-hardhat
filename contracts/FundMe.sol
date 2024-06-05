// SPDX-License-Identifier: MIT
// 1. Pragma version
pragma solidity 0.8.24;
// 2. Imports
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// 3. Interfaces, Libraries, Contracts
error FundMe__NotOwner();

/**
 * @title A contract for crowd funding
 * @author Oleksii Kvasov
 * @notice This contract is to demo sample funding contract
 * @dev It's implements price feeds as our library
 */
contract FundMe is ERC165 {
  // 1. Type Declarations
  using PriceConverter for uint256;

  // 2. State variables
  uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
  address private immutable i_owner;
  address[] private s_funders;
  mapping(address => uint256) private s_addressToAmountFunded;
  AggregatorV3Interface private s_priceFeed;
  // Interface ID for FundMe (calculated manually)
  bytes4 private constant _INTERFACE_ID_FUNDME =
    bytes4(keccak256("fund()")) ^
      bytes4(keccak256("withdraw()")) ^
      bytes4(keccak256("cheapWithdraw()")) ^
      bytes4(keccak256("getAddressToAmountFunded(address)")) ^
      bytes4(keccak256("getVersion()")) ^
      bytes4(keccak256("getFunder(uint256)")) ^
      bytes4(keccak256("getOwner()")) ^
      bytes4(keccak256("getPriceFeed()"));

  // 3. Events (we have none!)

  // 4. Modifiers
  modifier onlyOwner() {
    // require(msg.sender == owner);
    if (msg.sender != i_owner) revert FundMe__NotOwner();
    _;
  }

  // 5. Functions Order:
  //// constructor
  //// receive
  //// fallback
  //// external
  //// public
  //// internal
  //// private
  //// view / pure

  constructor(address priceFeedAddress) {
    i_owner = msg.sender;
    s_priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  receive() external payable {}

  fallback() external payable {}

  // Explainer from: https://solidity-by-example.org/fallback/
  // Ether is sent to contract
  //      is msg.data empty?
  //          /   \
  //         yes  no
  //         /     \
  //    receive()?  fallback()
  //     /   \
  //   yes   no
  //  /        \
  //receive()  fallback()

  /**
   * @notice This funds this contract
   * @dev It's implements price feeds as our library
   */
  function fund() public payable {
    require(
      msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
      "You need to spend more ETH!"
    );
    // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
    s_addressToAmountFunded[msg.sender] += msg.value;
    s_funders.push(msg.sender);
  }

  function withdraw() public payable onlyOwner {
    for (
      uint256 funderIndex = 0;
      funderIndex < s_funders.length;
      funderIndex++
    ) {
      address funder = s_funders[funderIndex];
      s_addressToAmountFunded[funder] = 0;
    }
    s_funders = new address[](0);
    // // transfer
    // payable(msg.sender).transfer(address(this).balance);
    // // send
    // bool sendSuccess = payable(msg.sender).send(address(this).balance);
    // require(sendSuccess, "Send failed");
    // call
    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }("");
    require(callSuccess, "Call failed");
  }

  function cheapWithdraw() public payable onlyOwner {
    address[] memory funders = s_funders;
    for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
      address funder = funders[funderIndex];
      s_addressToAmountFunded[funder] = 0;
    }
    s_funders = new address[](0);
    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }("");
    require(callSuccess, "Call failed");
  }

  /** @notice Gets the amount that an address has funded
   *  @param fundingAddress the address of the funder
   *  @return the amount funded
   */
  function getAddressToAmountFunded(
    address fundingAddress
  ) public view returns (uint256) {
    return s_addressToAmountFunded[fundingAddress];
  }

  function getVersion() public view returns (uint256) {
    return s_priceFeed.version();
  }

  function getFunder(uint256 index) public view returns (address) {
    return s_funders[index];
  }

  function getOwner() public view returns (address) {
    return i_owner;
  }

  function getPriceFeed() public view returns (AggregatorV3Interface) {
    return s_priceFeed;
  }

  // Implement supportsInterface
  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override returns (bool) {
    return
      interfaceId == _INTERFACE_ID_FUNDME ||
      super.supportsInterface(interfaceId);
  }
}
