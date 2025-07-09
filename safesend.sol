// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SafeSend
 * @dev A trustless escrow contract for secure ETH transfers with password verification
 * @notice Allows users to send ETH safely by requiring recipient password confirmation
 */
contract SafeSend {
    // Constants
    uint256 public constant NOTIFICATION_AMOUNT = 0.001 ether;
    uint256 public constant MIN_DEPOSIT = 0.01 ether;
    uint256 public constant MAX_EXPIRY_HOURS = 24;
    uint256 public constant DEFAULT_EXPIRY_MINUTES = 30;
    
    // State variables
    uint256 public nextDepositId;
    
    // Structs
    struct Deposit {
        address depositor;      // User A who sent the funds
        address recipient;      // User B who will receive the funds
        bytes32 passwordHash;   // Hash of the password
        uint256 amount;         // Amount claimable by recipient (after notification sent)
        uint256 expiryTime;     // When the deposit expires
        bool claimed;           // Whether funds have been claimed
        bool cancelled;         // Whether deposit has been cancelled
    }
    
    // Storage
    mapping(uint256 => Deposit) public deposits;
    
    // Events
    event DepositCreated(
        uint256 indexed depositId,
        address indexed depositor,
        address indexed recipient,
        uint256 amount,
        uint256 notificationAmount,
        uint256 expiryTime
    );
    
    event FundsClaimed(
        uint256 indexed depositId,
        address indexed recipient,
        uint256 amount
    );
    
    event DebugLog(string message);
    
    event DebugHash(string label, bytes32 hash);
    
    event DepositCancelled(
        uint256 indexed depositId,
        address indexed depositor,
        uint256 refundAmount
    );
    
    /**
     * @dev Create a new safe send deposit
     * @param recipient Address that will receive the funds
     * @param passwordHash Hash of the password (should include salt)
     * @param expiryMinutes How many minutes until expiry (max 24 hours)
     */
    function createDeposit(
        address recipient,
        bytes32 passwordHash,
        uint256 expiryMinutes
    ) external payable {
        require(recipient != address(0), "Invalid recipient address");
        require(recipient != msg.sender, "Cannot send to yourself");
        require(msg.value >= MIN_DEPOSIT + NOTIFICATION_AMOUNT, "Deposit too small");
        require(passwordHash != bytes32(0), "Password hash required");
        require(expiryMinutes > 0 && expiryMinutes <= MAX_EXPIRY_HOURS * 60, "Invalid expiry time");
        
        // Calculate amounts
        uint256 claimableAmount = msg.value - NOTIFICATION_AMOUNT;
        uint256 expiryTime = block.timestamp + (expiryMinutes * 60);
        
        // Send notification amount immediately to recipient
        (bool success, ) = payable(recipient).call{value: NOTIFICATION_AMOUNT}("");
        require(success, "Failed to send notification");
        
        // Store deposit
        uint256 depositId = nextDepositId++;
        deposits[depositId] = Deposit({
            depositor: msg.sender,
            recipient: recipient,
            passwordHash: passwordHash,
            amount: claimableAmount,
            expiryTime: expiryTime,
            claimed: false,
            cancelled: false
        });
        
        emit DepositCreated(
            depositId,
            msg.sender,
            recipient,
            claimableAmount,
            NOTIFICATION_AMOUNT,
            expiryTime
        );
    }
    
    /**
     * @dev Claim funds with the correct password
     * @param depositId The ID of the deposit to claim
     * @param password The password to verify
     */
    function claim(uint256 depositId, string memory password) external {
        Deposit storage deposit = deposits[depositId];
        
        emit DebugLog("Step 1: Starting claim");
        require(deposit.depositor != address(0), "Deposit does not exist");
        
        emit DebugLog("Step 2: Deposit exists");
        require(msg.sender == deposit.recipient, "Only recipient can claim");
        
        emit DebugLog("Step 3: Sender is recipient");
        require(!deposit.claimed, "Already claimed");
        
        emit DebugLog("Step 4: Not already claimed");
        require(!deposit.cancelled, "Deposit cancelled");
        
        emit DebugLog("Step 5: Not cancelled");
        require(block.timestamp <= deposit.expiryTime, "Deposit expired");
        
        emit DebugLog("Step 6: Not expired");
        
        // Verify password hash
        bytes32 computedHash = keccak256(abi.encodePacked(password, deposit.recipient, depositId));
        emit DebugHash("Computed hash", computedHash);
        emit DebugHash("Stored hash", deposit.passwordHash);
        
        require(computedHash == deposit.passwordHash, "Invalid password");
        
        emit DebugLog("Step 7: Password verified");
        
        // Mark as claimed and transfer funds
        deposit.claimed = true;
        uint256 amount = deposit.amount;
        
        emit DebugLog("Step 8: About to transfer");
        
        (bool success, ) = payable(deposit.recipient).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit DebugLog("Step 9: Transfer successful");
        emit FundsClaimed(depositId, deposit.recipient, amount);
    }
    
    /**
     * @dev Cancel a deposit and refund the depositor
     * @param depositId The ID of the deposit to cancel
     */
    function cancel(uint256 depositId) external {
        Deposit storage deposit = deposits[depositId];
        
        require(deposit.depositor != address(0), "Deposit does not exist");
        require(msg.sender == deposit.depositor, "Only depositor can cancel");
        require(!deposit.claimed, "Already claimed");
        require(!deposit.cancelled, "Already cancelled");
        
        // Mark as cancelled and refund
        deposit.cancelled = true;
        uint256 refundAmount = deposit.amount;
        
        (bool success, ) = payable(deposit.depositor).call{value: refundAmount}("");
        require(success, "Refund failed");
        
        emit DepositCancelled(depositId, deposit.depositor, refundAmount);
    }
    
    /**
     * @dev Get deposit details
     * @param depositId The ID of the deposit
     * @return depositor Address of the user who created the deposit
     * @return recipient Address of the user who will receive the funds
     * @return passwordHash Hash of the password
     * @return amount Amount claimable by recipient
     * @return expiryTime When the deposit expires
     * @return claimed Whether funds have been claimed
     * @return cancelled Whether deposit has been cancelled
     */
    function getDeposit(uint256 depositId) external view returns (
        address depositor,
        address recipient,
        bytes32 passwordHash,
        uint256 amount,
        uint256 expiryTime,
        bool claimed,
        bool cancelled
    ) {
        Deposit storage deposit = deposits[depositId];
        return (
            deposit.depositor,
            deposit.recipient,
            deposit.passwordHash,
            deposit.amount,
            deposit.expiryTime,
            deposit.claimed,
            deposit.cancelled
        );
    }
    
    /**
     * @dev Check if a deposit has expired
     * @param depositId The ID of the deposit
     * @return Whether the deposit has expired
     */
    function isExpired(uint256 depositId) external view returns (bool) {
        Deposit storage deposit = deposits[depositId];
        require(deposit.depositor != address(0), "Deposit does not exist");
        return block.timestamp > deposit.expiryTime;
    }
    
    /**
     * @dev Get the current timestamp (useful for frontend)
     * @return Current block timestamp
     */
    function getCurrentTime() external view returns (uint256) {
        return block.timestamp;
    }
}
