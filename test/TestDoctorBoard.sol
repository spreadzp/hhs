pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/DoctorBoard.sol";
import "../contracts/MetaCoin.sol";

contract TestDoctorBoard {
    DoctorBoard db;
    uint256 priceContract;
    address doctor;
    uint256 timeOfContract;
    bytes32 hashNewContract;

    function beforeEach() public {
        db = DoctorBoard(DeployedAddresses.DoctorBoard());
        doctor = DeployedAddresses.MetaCoin();
        priceContract = 1000;
        timeOfContract = now + 10000;
        hashNewContract = stringToBytes32("new contract");
    } 

    function testCreateOrderAnalise() public {
        // DoctorBoard db = new DoctorBoard();
        bytes32 hashContract = "EOS8WE79SonHGHc5DquV4fxty9bHfnLS";

        Assert.equal(db.isActiveContract(hashContract), false, "Contract is exists");
    }

    function testAddNewDoctorsContract() public {
    
        db.addNewDoctorsContract(doctor, priceContract, timeOfContract, hashNewContract);
        Assert.equal(db.checkOwnerContract(hashNewContract), doctor, "Wrong address");
        Assert.equal(db.isActiveContract(hashNewContract), true, "Contract isn't exists");
    }

    function testExpiredContract() public { 
        uint256 newTimeOfContract = now - 10000;
        bytes32 hashNewContract = stringToBytes32("new contract1");
        db.addNewDoctorsContract(doctor, priceContract, newTimeOfContract, hashNewContract);
        Assert.equal(db.checkOwnerContract(hashNewContract), doctor, "Wrong address");
        Assert.equal(db.isActiveContract(hashNewContract), false, "Contract isn't exists");
    }

    function testConvertData() public {
        string memory data = "test data";
        bytes32 data32 = stringToBytes32(data); 
        Assert.equal(bytes32ToShortString(data32), data, "Convert wrong");
    }
    
    function testUserAddOrder() public {
        bytes32 encryptedToken = stringToBytes32("HKKKLHG70JH45");
        bytes32 encryptedUrlToFile = stringToBytes32("HLMLUY87HJGF");
        db.createOrderAnalise (hashContract, encryptedToken, encryptedUrlToFile);
   
    Assert.equal(db.checkHashUser())
    }

    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    function bytes32ToShortString(bytes32 _data)
        pure
        public
        returns (string memory)
        {
        // create new bytes with a length of 32
        // needs to be bytes type rather than bytes32 in order to be writeable
        bytes memory _bytesContainer = new bytes(32);
        // uint to keep track of actual character length of string
        // bytes32 is always 32 characters long the string may be shorter
        uint256 _charCount = 0;
        // loop through every element in bytes32
        for (uint256 _bytesCounter = 0; _bytesCounter < 32; _bytesCounter++) {
            /*
            TLDR: takes a single character from bytes based on counter
            convert bytes32 data to uint in order to increase the number enough to
            shift bytes further left while pushing out leftmost bytes
            then convert uint256 data back to bytes32
            then convert to bytes1 where everything but the leftmost hex value (byte)
            is cutoff leaving only the leftmost byte
            */
            bytes1 _char = bytes1(bytes32(uint256(_data) * 2 ** (8 * _bytesCounter)));
            // if the character is not empty
            if (_char != 0) {
                // add to bytes representing string
                _bytesContainer[_charCount] = _char;
                // increment count so we know length later
                _charCount++;
            }
        }

        // create dynamically sized bytes array to use for trimming
        bytes memory _bytesContainerTrimmed = new bytes(_charCount);

        // loop through for character length of string
        for (uint256 _charCounter = 0; _charCounter < _charCount; _charCounter++) {
            // add each character to trimmed bytes container, leaving out extra
            _bytesContainerTrimmed[_charCounter] = _bytesContainer[_charCounter];
        }

        // return correct length string with no padding
        return string(_bytesContainerTrimmed);
    }
}
