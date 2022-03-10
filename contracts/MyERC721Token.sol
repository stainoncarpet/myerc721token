//SPDX-License-Identifier: MIT

pragma solidity >=0.8.11 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//https://eips.ethereum.org/EIPS/eip-721
contract MyERC721Token is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    string private TOKEN_BASE_URI;
    uint8 private MAX_SUPPLY;

    constructor(string memory baseUri, uint8 maxSupply) public ERC721("MyERC721Token", "MNFT") {
        TOKEN_BASE_URI = baseUri;
        MAX_SUPPLY = maxSupply;
    }

    fallback() external payable onlyIfLimitNotReached {
        mint();
    }

    receive() external payable onlyIfLimitNotReached {
        mint();
    }

    modifier onlyIfLimitNotReached() {
        require(_tokenIds.current() < MAX_SUPPLY, "Token limit reached");
        require(msg.value == 0.1 ether, "0.1 ETH only");
        _;
    }

    function mint() internal {
        _safeMint(msg.sender, _tokenIds.current());
        emit Transfer(address(0), msg.sender, _tokenIds.current());
        _tokenIds.increment();
    }

    function maxSupply() external view returns(uint8) {
        return MAX_SUPPLY;
    }

    function tokenURI(uint256 tokenId) public view override returns(string memory) {
        string memory tokenUri = string(abi.encodePacked(TOKEN_BASE_URI, Strings.toString(tokenId), ".json"));
        return tokenUri;
    }

    function destroyContract() external onlyOwner {
        selfdestruct(payable(owner()));
    }
}