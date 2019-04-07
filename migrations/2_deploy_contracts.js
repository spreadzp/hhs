var ConvertLib = artifacts.require("./ConvertLib.sol");
var HhsCoin = artifacts.require("./HhsCoin.sol");
var DoctorBoard = artifacts.require("./DoctorBoard.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, HhsCoin);
  deployer.deploy(HhsCoin);
  deployer.deploy(DoctorBoard);
};
