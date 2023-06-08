// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DCManager {
    IERC20 public DCtoken;
    IERC20 public USDT;
    uint256 decimals = 10 ** 18;
    address dWallet;
    address owner;
    uint256 public vestingPeriod;
    uint256 public Dclaimed;
    uint256 public tokenPrice = 10**5;
    mapping(address => uint256) public userBalance;
    modifier onlyOwner() {
        require(
            (msg.sender == owner),
            "you are not allowed to utilise this function"
        );
        _;
    }

    bool private locked;
    modifier nonReentrant() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }

    constructor(address _token, address _usdt) {
        DCtoken = IERC20(_token);
        USDT = IERC20(_usdt);
        vestingPeriod = block.timestamp + 90 days;
    }

    function sellTokens(uint256 _amount) public nonReentrant {
        require(_amount > 1 * decimals, "you can not sell less than 1 DC");
        require(
            DCtoken.transferFrom(msg.sender, address(this), _amount),
            "please increase the allowance"
        );
        userBalance[msg.sender] += _amount;
    }
    
    function claimUSDT(uint256 _amount)public nonReentrant{
        require(userBalance[msg.sender]>1*decimals,"you dont have enough balance");
        uint256 total = userBalance[msg.sender] * tokenPrice/decimals;
        require(_amount <= total,"you can not claim more than your balance");
        userBalance[msg.sender] -= _amount;
        USDT.transfer(msg.sender,_amount);
    }

    function claimDReward() public nonReentrant {
        require(msg.sender == dWallet, "you are not allowed to claim reward");
        require(
            block.timestamp > vestingPeriod,
            "you can not sell less than 1 DC"
        );
        uint256 timeDiff = block.timestamp - vestingPeriod;
        timeDiff = timeDiff / (1 days);
        uint256 total = timeDiff * decimals;
        uint256 amount = total - Dclaimed;
        if(amount+Dclaimed>20_000_000*decimals){
            amount = 20_000_000*decimals - Dclaimed;
        }
        Dclaimed += amount;
        DCtoken.transfer(msg.sender, amount);
    }
    // admin functions
    function changePrice(uint256 _newPrice) public onlyOwner nonReentrant{
        tokenPrice = _newPrice;
    }
    function withdrawTokens(address _wallet) public onlyOwner nonReentrant{
            DCtoken.transfer(_wallet, DCtoken.balanceOf(address(this)));
    }
    function withdrawUSDT(address _wallet) public onlyOwner nonReentrant{
            USDT.transfer(_wallet, USDT.balanceOf(address(this)));
    }
    function transferOwnership(address newOwner) public onlyOwner nonReentrant {
        owner = newOwner;
    }
}
