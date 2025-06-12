// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract MyERC1967Proxy is ERC1967Proxy {
    constructor()
        ERC1967Proxy(
            0x0bA94EE4F91203471A37C2cC36be04872671C22e, // implementation address
            abi.encodeWithSignature(
                "initialize(address,uint256,address,address,bool,address,uint256)",
                0xd2DE49f2D495A9240D16c95fA76d08A698e2d44B, // initialOwner
                250, // initialDefaultFeePercentage (2.5%)
                0xd2DE49f2D495A9240D16c95fA76d08A698e2d44B, // initialFeeRecipient
                0x1639269Ed4fe6Ff1FC1218Cc1cB485313eb50A21, // initialLifeNodesNFTContract
                false, // initialRoyaltiesDisabled
                0x22456dA8e1CaCB25edBA86403267B4F13900AdF1, // initialAfterMintStorageAddress
                32323 // chainId
            )
        ) {}
} 