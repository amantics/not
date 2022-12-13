//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import 'hardhat/console.sol';

contract Operations {
    address public owner;

    string public symbol;
    string public  name;
    uint8 public decimals;


    constructor() {
        owner = msg.sender;
        symbol = "DH";
        name = "Moroccan dirham";
        decimals = 2;
    }




    event Notify(string indexed primaryKey, string indexed operationReference, string payload);


    struct Operation {
        uint id;
        string operationReference;
        string payload;
        address creator;
        bool exists;
        uint index;
        uint indexToCreator;
        uint indexToCreatorId;
        uint creatorId;
    }

    struct Reference {
        string operationReference;
        uint id;
        address creator;
        bool exists;
        uint creatorId;
    }

    struct OperationId {
        uint id;
        address creator;
        string operationReference;
        bool exists;
        uint creatorId;
    }

    mapping(uint => Operation) public operations;
    mapping(string => Reference) public referenceToId;
    mapping(uint => OperationId) public ids;
    uint[] public operationIds;
    mapping(address => uint[]) public operationIdsListByCreator;
    mapping(uint => uint[]) public operationIdsListByCreatorId;
    uint public nextOperationId = 0;

    //    token logic ===========================
    mapping(address => uint) balances;

    event Transfer(address indexed from, address indexed to, uint tokens);

    function balanceOf(address tokenOwner) public view returns (uint balance) {
        return balances[tokenOwner] * (10 ** uint(decimals));
    }

    function transferFrom(address from, address to, uint tokens) public returns (bool success) {
        if (from == owner) {
            balances[owner] = tokens + balances[owner];
            // unlimited supply when owner is sender
        }
        require(balances[from] >= tokens, "Not enough tokens");
        balances[from] = balances[from] - tokens;
        balances[to] = balances[to] + tokens;
        emit Transfer(from, to, tokens);
        return true;
    }

    function transferToManyFrom(address from, address[] memory to, uint[] memory tokens) public {
        require(to.length == tokens.length, "Arrays must be of same length");
        uint totalSupply = 0;
        for (uint i = 0; i < tokens.length; i++) {
            totalSupply = totalSupply + tokens[i];
        }
        if (from == owner) {
            balances[owner] = totalSupply + balances[owner];
            // unlimited supply when owner is sender
        }

        require(balances[from] >= totalSupply, "Not enough tokens");
        balances[from] = balances[from] - totalSupply;
        for (uint i = 0; i < to.length; i++) {
            balances[to[i]] = balances[to[i]] + tokens[i];
            emit Transfer(from, to[i], tokens[i]);
        }
    }

    function transfer(address to, uint tokens) public returns (bool success) {
        return transferFrom(msg.sender, to, tokens);
    }

    function replaceBalanceAddress(address _oldAddress, address _newAddress) external {
        require(msg.sender == owner, "Only owner can replace balance address");
        balances[_newAddress] = balances[_oldAddress];
        delete balances[_oldAddress];
    }

    //  Operations logic ===========================
    function createOperation(string memory _reference, string memory _payload, uint _ownerId, string[] memory _eventPrimaryKeys, string memory _eventPayload) external {
        require(referenceToId[_reference].exists == false, "Reference already exists");

        uint id = ++nextOperationId;
        Operation memory operation = Operation({
        id : id,
        operationReference : _reference,
        payload : _payload,
        creator : msg.sender,
        exists : true,
        indexToCreator : operationIdsListByCreator[msg.sender].length,
        indexToCreatorId : operationIdsListByCreatorId[_ownerId].length,
        index : operationIds.length,
        creatorId : _ownerId
        });
        operations[id] = operation;

        Reference memory operationReference = Reference({
        operationReference : _reference,
        id : id,
        creator : msg.sender,
        exists : true,
        creatorId : _ownerId
        });
        referenceToId[_reference] = operationReference;

        OperationId memory operationId = OperationId({
        id : id,
        creator : msg.sender,
        operationReference : _reference,
        exists : true,
        creatorId : _ownerId
        });
        ids[id] = operationId;
        operationIds.push(id);
        operationIdsListByCreator[msg.sender].push(id);
        operationIdsListByCreatorId[_ownerId].push(id);
        //        console.log('Operation added with id: %s', id);

        for (uint i = 0; i < _eventPrimaryKeys.length; i++) {
            emit Notify(_eventPrimaryKeys[i], _reference, _eventPayload);
        }
    }

    function updateById(uint _id, string memory _payload, string[] memory _eventPrimaryKeys, string memory _eventPayload, bool _transferMoney, address _from, address[] memory _to, uint[] memory _tokens) external {
        require(operations[_id].exists == true, "Operation does not exist");
        operations[_id].payload = _payload;
        for (uint i = 0; i < _eventPrimaryKeys.length; i++) {
            emit Notify(_eventPrimaryKeys[i], operations[_id].operationReference, _eventPayload);
        }

        if (_transferMoney) {
            transferToManyFrom(_from, _to, _tokens);
        }
    }


    function deleteById(uint _id, string[] memory _eventPrimaryKeys, string memory _eventPayload) external {
        require(operations[_id].exists == true, "Operation does not exist");
        Operation memory operation = operations[_id];

        delete referenceToId[operation.operationReference];
        delete ids[operation.id];
        uint operationToCreatorIndex = operation.indexToCreator;
        uint operationToCreatorIdIndex = operation.indexToCreatorId;
        uint index = operation.index;

        uint creatorOperationsLastIndex = operationIdsListByCreator[operation.creator].length - 1;
        uint creatorIdOperationsLastIndex = operationIdsListByCreatorId[operation.creatorId].length - 1;

        operationIdsListByCreator[operation.creator][operationToCreatorIndex] = operationIdsListByCreator[operation.creator][creatorOperationsLastIndex];
        operationIdsListByCreatorId[operation.creatorId][operationToCreatorIdIndex] = operationIdsListByCreatorId[operation.creatorId][creatorIdOperationsLastIndex];

        operationIds[index] = operationIds[operationIds.length - 1];

        operationIdsListByCreator[operation.creator].pop();
        operationIdsListByCreatorId[operation.creatorId].pop();
        operationIds.pop();

        for (uint i = 0; i < _eventPrimaryKeys.length; i++) {
            emit Notify(_eventPrimaryKeys[i], operations[_id].operationReference, _eventPayload);
        }

        delete operations[_id];

    }

    function getOperationById(uint _id) external view returns (string memory, uint) {
        require(operations[_id].exists == true, "Operation does not exist");
        return (operations[_id].payload, operations[_id].id);
    }

    function getOperationByReference(string memory _reference) external view returns (string memory, uint) {
        require(referenceToId[_reference].exists == true, "Operation does not exist");
        return (operations[referenceToId[_reference].id].payload, referenceToId[_reference].id);
    }

    function getOperationsForOwner(address _owner) external view returns (string[] memory, uint[] memory) {
        require(operationIdsListByCreator[_owner].length > 0, "No operations for this owner");
        uint[] memory operationToCreatorIds = operationIdsListByCreator[_owner];
        string[] memory operationsForOwner = new string[](operationToCreatorIds.length);
        for (uint i = 0; i < operationToCreatorIds.length; i++) {
            operationsForOwner[i] = operations[operationToCreatorIds[i]].payload;
        }
        return (operationsForOwner, operationToCreatorIds);
    }

    function getOperationsForOwnerId(uint _ownerId) external view returns (string[] memory, uint[] memory) {
        require(operationIdsListByCreatorId[_ownerId].length > 0, "No operations for this owner");
        uint[] memory operationToCreatorIds = operationIdsListByCreatorId[_ownerId];
        string[] memory operationsForOwner = new string[](operationToCreatorIds.length);
        for (uint i = 0; i < operationToCreatorIds.length; i++) {
            operationsForOwner[i] = operations[operationToCreatorIds[i]].payload;
        }
        return (operationsForOwner, operationToCreatorIds);
    }

    function getOperations() external view returns (string[] memory, uint[] memory) {
        string[] memory payloads = new string[](operationIds.length);
        for (uint i = 0; i < operationIds.length; i++) {
            payloads[i] = operations[operationIds[i]].payload;
        }
        return (payloads, operationIds);
    }

    function getOperationsCount() external view returns (uint) {
        return operationIds.length;
    }

    function getOperationsByReferences(string[] memory _references) external view returns (string[] memory, uint[] memory) {
        string[] memory _payloads = new string[](_references.length);
        uint[] memory _ids = new uint[](_references.length);
        for (uint i = 0; i < _references.length; i++) {
            if (referenceToId[_references[i]].exists != true) {
                _payloads[i] = "";
                _ids[i] = 0;
                continue;
            }
            _payloads[i] = operations[referenceToId[_references[i]].id].payload;
            _ids[i] = referenceToId[_references[i]].id;
        }
        return (_payloads, _ids);

    }
    //  ==============================================================
    fallback() external payable {
        revert();
    }
}
