// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, ERC20Burnable, Ownable {

    constructor() ERC20("DC Token", "DC") {
         _mint(msg.sender, 1_500_000_000 *(10**18));
    }
    // make sure no mint function
    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        require(amount > 1 *(10**18),"you can not transfer less than 1 DC");
        _transfer(_msgSender(), recipient, amount);
        _burn(recipient, 1 *(10**18));
        return true;
    }

}