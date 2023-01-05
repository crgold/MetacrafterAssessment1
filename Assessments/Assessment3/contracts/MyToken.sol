// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract MyToken {
    address payable public owner;
    string public name;
    string public symbol;
    uint8 public decimal;
    uint256 public decimalConstant;
    uint256 private _totalSupply = 0;

    // balances of token holders
    mapping (address => uint256) private _balances;
    
    // contract events
    event Transfer(address reciever, uint256 amount);

    constructor() payable {
        owner = payable(msg.sender);
        name = "META";
        symbol = "MTA";
        decimal = 18;
        decimalConstant = 10 ** decimal;
        _mint(owner, 1000000 * decimalConstant);
    }

    function mint(address account, uint256 amount) public returns (bool) {
        _mint(account, amount * decimalConstant);
        return true;
    }

    function _mint(address account, uint256 amount) private {
        require(amount > 0);
        _totalSupply += amount;
        _transfer(account, amount);
    }

    function burn(address account, uint256 amount) public returns (bool) {
        _burn(account, amount * decimalConstant);
        return true;
    }

    function _burn(address account, uint256 amount) private {
        require(amount > 0 && _balances[account] >= amount);
        _totalSupply -= amount;
        _balances[account] -= amount;
    }

    function transfer(address reciever, uint256 amount) public returns (bool) {
        _transfer(reciever, amount * decimalConstant);
        return true;
    }

    function transferFrom(address sender, address reciever, uint256 amount) public returns (bool) {
        _transfer(sender, reciever, amount * decimalConstant);
        return true;
    }

    function _transfer(address reciever, uint256 amount) private {
        require(amount > 0);
        _balances[reciever] += amount;
        emit Transfer(reciever, amount);
    }

    function _transfer(address sender, address reciever, uint256 amount) private {
        require(amount > 0 && _balances[sender] >= amount);
        _balances[sender] -= amount;
        _balances[reciever] += amount;
        emit Transfer(reciever, amount);
    }

    function totalSupply() public view returns (uint256){
        return _totalSupply / decimalConstant;
    }

    function balanceOf(address account) public view returns (uint256){
        return _balances[account] / decimalConstant;
    }
}
