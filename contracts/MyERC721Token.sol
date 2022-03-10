//SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.11 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

//https://eips.ethereum.org/EIPS/eip-721
contract MyERC721Token is ERC721, ERC721URIStorage, Ownable {
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
        // start external index at 1
        string memory _uri = Strings.toString(_tokenIds.current() + 1);
        _setTokenURI(_tokenIds.current(), string(abi.encodePacked(_uri, ".json")));
        emit Transfer(address(0), msg.sender, _tokenIds.current());
        _tokenIds.increment();
    }

    function _baseURI() internal view override returns (string memory) {
        return TOKEN_BASE_URI;
    }

    function maxSupply() external view returns(uint8) {
        return MAX_SUPPLY;
    }

    // must be overridden, but not used in contract, makes 100% coverage impossible
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns(string memory) {
        return super.tokenURI(tokenId);
    }

    function destroyContract() external onlyOwner {
        selfdestruct(payable(owner()));
    }
}