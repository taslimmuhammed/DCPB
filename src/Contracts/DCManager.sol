// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
interface Burn {
    function burn(uint256 amount) external;
}
contract DCManager {
    address public DCtoken;
    IERC20 public USDT;
    uint256 DCdecimals = 10 ** 18;
    uint256 USDTdecimals = 10 ** 6;
    uint256 public totalSold;
    uint256 public index;
    address dWallet=0xF4fC364851D03A7Fc567362967D555a4d843647d;
    address public owner;
    uint256 public vestingPeriod;
    uint256 public Dclaimed;
    uint256 tokenPrice = 10;
    mapping(address => UserStruct) public Users;
    uint256 burnableTokens;
    struct UserStruct{
        uint256 balance;
        uint256 profit;
        uint256 totalCoins;
    }

    modifier onlyOwner(){
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
        DCtoken = _token;
        USDT = IERC20(_usdt);
        vestingPeriod = block.timestamp + 90 days;
        owner = msg.sender;
    }

    function sellTokens(uint256 _amount) public nonReentrant {
        require(_amount > 1 , "you can not sell less than 1 DC");
        require(
            IERC20(DCtoken).transferFrom(msg.sender, address(this), _amount*DCdecimals),
            "please increase the allowance"
        );
        Burn(DCtoken).burn(_amount*DCdecimals);
        Users[msg.sender].balance += _amount;
        Users[msg.sender].totalCoins += _amount;
        totalSold += _amount;
        if(totalSold>100_000){
            tokenPrice ++;
            index++;
            totalSold  = totalSold - 100_000;
        } 
        
    }
    
    function claimUSDT(uint256 _amount)public nonReentrant{
        require(Users[msg.sender].balance>1,"you dont have enough balance");
        require(_amount <= Users[msg.sender].balance,"you can not claim more than your balance");
        Users[msg.sender].balance -= _amount;
        uint256 USDTvalue = _amount * USDTdecimals * tokenPrice/100;
        Users[msg.sender].profit += USDTvalue;
        USDT.transfer(msg.sender,USDTvalue);
    }

    function claimDReward() public nonReentrant {
        require(msg.sender == dWallet, "you are not allowed to claim reward");
        require(
            block.timestamp > vestingPeriod,
            "you can not sell less than 1 DC"
        );
        uint256 timeDiff = block.timestamp - vestingPeriod;
        timeDiff = timeDiff / (1 days);
        uint256 total = timeDiff * DCdecimals;
        uint256 amount = total - Dclaimed;
        if(amount+Dclaimed>20_000_000*DCdecimals){
            amount = 20_000_000*DCdecimals - Dclaimed;
        }
        Dclaimed += amount;
        IERC20(DCtoken).transfer(msg.sender, amount);
    }
    //admin functions
    function withdrawTokens(address _wallet) public onlyOwner nonReentrant{
            IERC20(DCtoken).transfer(_wallet, IERC20(DCtoken).balanceOf(address(this)));
    }
    function withdrawUSDT(address _wallet) public onlyOwner nonReentrant{
            USDT.transfer(_wallet, USDT.balanceOf(address(this)));
    }
    function transferOwnership(address newOwner) public onlyOwner nonReentrant {
        owner = newOwner;
    }
}
