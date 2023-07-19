// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
interface Burnable is IERC20 {
    function burn(uint256 amount) external;
}
contract DCManager {
    Burnable public DCtoken;
    IERC20 public USDT;
    uint256 DCdecimals = 10 ** 18;
    uint256 USDTdecimals = 10 ** 6;
    uint256 public totalSold;
    uint256 public totalClaimed;
    uint256 public index;
    address sWallet=0xF4fC364851D03A7Fc567362967D555a4d843647d;
    address owner;
    uint256 public vestingPeriod;
    uint256 public Dclaimed;
    uint256 public tokenPrice = 10;
    mapping(address => UserStruct) public Users;
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
        DCtoken = Burnable(_token);
        USDT = IERC20(_usdt);
        vestingPeriod = block.timestamp ;
        owner = msg.sender;
    }

    function sellTokens(uint256 _amount) public nonReentrant {
        require(_amount > 1 , "you can not sell less than 1 DC");
        require(
            IERC20(DCtoken).transferFrom(msg.sender, address(this), _amount*DCdecimals),
            "please increase the allowance"
        );
        Users[msg.sender].balance += _amount;
        Users[msg.sender].totalCoins += _amount;
        totalSold += _amount;
        DCtoken.burn(_amount*DCdecimals);
        if(totalSold>=100_000){
            tokenPrice ++;
            index++;
            totalSold  = totalSold - 100_000;
        } 
    }
    
    function getTotalSold() public view returns(uint256){
        return totalSold+index*100_000;
    }
    function claimUSDT(uint256 _amount)public nonReentrant{
        require(Users[msg.sender].balance>1,"you dont have enough balance");
        require(_amount <= Users[msg.sender].balance,"you can not claim more than your balance");
        Users[msg.sender].balance -= _amount;
        totalClaimed += _amount;
        uint256 USDTvalue = _amount * USDTdecimals * tokenPrice/100;
        Users[msg.sender].profit += USDTvalue;
        USDT.transfer(msg.sender,USDTvalue);
    }

    function claimSReward() public nonReentrant {
        require(msg.sender == sWallet, "you are not allowed to claim reward");
        require(
            block.timestamp > vestingPeriod,
            "you can not sell less than 1 DC"
        );
        uint256 timeDiff = block.timestamp - vestingPeriod;
        timeDiff = timeDiff / (60);
        uint256 total = timeDiff * DCdecimals;
        uint256 amount = total - Dclaimed;
        if(amount+Dclaimed>20_000_000*DCdecimals){
            amount = 20_000_000*DCdecimals - Dclaimed;
        }
        
        Dclaimed += amount;
        IERC20(DCtoken).transfer(sWallet, amount);
    }
    //owner functions
    function withdrawTokens(address _wallet) public onlyOwner nonReentrant{
            IERC20(DCtoken).transfer(_wallet, IERC20(DCtoken).balanceOf(address(this)));
    }
    function withdrawUSDT(uint256 _amount) public onlyOwner nonReentrant{
            USDT.transfer(owner,_amount);
    }
    function transferOwnership(address newOwner) public onlyOwner nonReentrant {
        owner = newOwner;
    }
}
