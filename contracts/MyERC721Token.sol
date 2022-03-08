//SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.11 <0.9.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/* 
    +function balanceOf(address _owner) external view returns (uint256);
    +function ownerOf(uint256 _tokenId) external view returns (address);
    +function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable;
    +function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;
    +function transferFrom(address _from, address _to, uint256 _tokenId) external payable;
    +function approve(address _approved, uint256 _tokenId) external payable;
    +function setApprovalForAll(address _operator, bool _approved) external;
    +function getApproved(uint256 _tokenId) external view returns (address);
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);

    +event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    +event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    +event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
*/

/* uri json example
    {
        "name": "Thor's hammer",
        "description": "Mjölnir, the legendary hammer of the Norse god of thunder.",
        "image": "https://game.example/item-id-8u5h2m.png",
        "strength": 20
    }
 */

//https://eips.ethereum.org/EIPS/eip-721
contract MyERC721Token is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    string private TOKEN_BASE_URI;
    uint8 private MAX_SUPPLY = 50;

    constructor(string memory baseUri) public ERC721("MyERC721Token", "MNFT") {
        TOKEN_BASE_URI = baseUri;
    }

    fallback() external payable onlyIfLimitNotReached {
        mint();
    }

    receive() external payable onlyIfLimitNotReached {
        mint();
    }

    modifier onlyIfLimitNotReached() {
        require(_tokenIds.current() < 50, "Token limit reached"); // index0 is in play
        require(msg.value == 0.1 ether, "0.1 ETH only");
        _;
    }

    function mint() internal {
        _safeMint(msg.sender, _tokenIds.current());
        // start external index at 1
        _setTokenURI(_tokenIds.current(), Strings.toString(_tokenIds.current() + 1));
        emit Transfer(address(0), msg.sender, _tokenIds.current());
        _tokenIds.increment();
    }

    function _baseURI() internal view override returns (string memory) {
        return TOKEN_BASE_URI;
    }

    function maxSupply() external view returns(uint8) {
        return MAX_SUPPLY;
    }

    // must be overridden, but not used in contract
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns(string memory) {
        return super.tokenURI(tokenId);
    }
}