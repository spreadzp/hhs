pragma solidity >=0.4.22 <0.6.0;

library SafeMath {
    /**
     * @dev Multiplies two unsigned integers, reverts on overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b);

        return c;
    }

    /**
     * @dev Integer division of two unsigned integers truncating the quotient, reverts on division by zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Subtracts two unsigned integers, reverts on overflow (i.e. if subtrahend is greater than minuend).
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Adds two unsigned integers, reverts on overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);

        return c;
    }

    /**
     * @dev Divides two unsigned integers and returns the remainder (unsigned integer modulo),
     * reverts when dividing by zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}

contract DoctorBoard {
    using SafeMath for uint256;
    mapping(address => uint256) rating;
    mapping(address => string) tokenPatient;
    mapping(bytes32 => mapping (bytes32 => bool)) isHashUserCloseOrder;
    mapping(address => bytes32[]) doctorContracts;
    mapping(bytes32 => Doctor) hashContractAndPerformer;
    mapping(address => bytes32) doctorHashOrder;
    mapping(bytes32 => bytes32) hashUserOfOrder;
    mapping(bytes32 => bytes32) hashUserHashResponse;
    mapping(address => bytes32) userHashOrder;
    event changeRating(address _doctorAddress, bytes32 _hashContract, uint256 _rating);
    event newOrder (address _doctorAddress, bytes32 _encryptedToken, bytes32 _encryptedUrlToFile, bytes32 _responseHash);
    event notifyCloseOrder (bytes32 _orderHash, bytes32 _encryptedUrlRepor);
    event notifyDoctorHaveContract (address _doctorAddress, bytes32 _newContract);
    event notifyToken (string _urlToken);
    struct Doctor {
        address doctor;
        uint256 price;
        uint256 expiredTime;
    }

    modifier isDoctorHaveOrder(address doctorAddress, bytes32 orderHash) {
        require(doctorHashOrder[doctorAddress] != orderHash, "the doctor hasn't the order");
        _;
    }

    modifier isNewContractDoctor(address doctorAddress, bytes32 orderHash) {
        uint256 countContracts = doctorContracts[doctorAddress].length;
        for (uint256 index = 0; index < countContracts; index++) {
            require(doctorHashOrder[doctorAddress] == orderHash, "wrong doctor address");
        }
        _;
    }
    
    function createOrderAnalise (bytes32 hashContract, bytes32 encryptedToken, bytes32 encryptedUrlToFile) public {
        address doctorAddress = hashContractAndPerformer[hashContract].doctor;
        bytes32 responseHash = keccak256(abi.encode(msg.sender, doctorAddress, now));
        // bytes32 responseHash = "wwww"
        userHashOrder[msg.sender] = responseHash;
        isHashUserCloseOrder[responseHash][hashContract] = false;
        emit newOrder(doctorAddress, encryptedToken, encryptedUrlToFile, responseHash);
    }
    
    function closeOrder(bytes32 orderHash, bytes32 hashContract, bytes32 encryptedUrlReport) public isDoctorHaveOrder(msg.sender, orderHash) {
        require(!isHashUserCloseOrder[orderHash][hashContract], "The order closed!");
        rating[msg.sender] = rating[msg.sender].add(1);
        hashUserHashResponse[orderHash] = encryptedUrlReport;
        isHashUserCloseOrder[orderHash][hashContract] = true;
        emit changeRating(msg.sender, hashContract, rating[msg.sender]);
        emit notifyCloseOrder(orderHash, encryptedUrlReport);
    }

    function checkReportOrder(bytes32 orderHash)public view returns(bytes32) {
        return hashUserHashResponse[orderHash];
    }

    function checkHashUser(address user)public view returns(bytes32) {
        return userHashOrder[user];
    }

    function addNewDoctorsContract(address doctorAddress, uint256 priceContract, uint256 timeOfContract, bytes32 newContract) public {
        doctorContracts[doctorAddress].push(newContract);
        require(!isActiveContract(newContract), "Contract not expired yet for change");
        hashContractAndPerformer[newContract] = Doctor({doctor: doctorAddress, price: priceContract, expiredTime: timeOfContract});
        emit notifyDoctorHaveContract(doctorAddress, newContract);
    }
    
    function isActiveContract(bytes32 hashContract) public view  returns (bool) {
        return hashContractAndPerformer[hashContract].expiredTime > now;
    }

    function checkOwnerContract(bytes32 hashContract) public view  returns (address) {
        return hashContractAndPerformer[hashContract].doctor;
    }

    function checkTokenPatient() public returns (string memory token) {
        token = tokenPatient[msg.sender];
        emit notifyToken(token);
        return token;
    }

    function setTokenPatient(address doctor, string memory token) public  {
        tokenPatient[doctor] = token;
        emit notifyToken(token);
    }

    function checkHashOrder(bytes32 hashContract) public pure returns (bytes32) {
        return hashContract;
    }

    // convert a string less than 32 characters long to bytes32
    function toBytes32(string memory _string)
        // pure means we are not accessing state nor changing state
        pure
        public
        returns (bytes32)
    {
        // make sure that the string isn't too long for this function
        // will work but will cut off the any characters past the 32nd character
        require(bytes(_string).length <= 32);
        bytes32 _stringBytes;

        // simplest way to convert 32 character long string
        assembly {
        // load the memory pointer of string with an offset of 32
        // 32 passes over non-core data parts of string such as length of text
        _stringBytes := mload(add(_string, 32))
        }

        return _stringBytes;
    }
}
