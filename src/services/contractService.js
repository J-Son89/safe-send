import { Contract, parseEther, formatEther, keccak256, toUtf8Bytes } from 'ethers'
import SafeSendABI from '../contracts/SafeSend.json'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
const SEPOLIA_CHAIN_ID = 11155111

export class ContractService {
  constructor(provider, signer) {
    console.log('Creating ContractService with address:', CONTRACT_ADDRESS)
    this.provider = provider
    this.signer = signer
    this.contract = new Contract(CONTRACT_ADDRESS, SafeSendABI.abi, signer)
    // Use the same provider for read operations to avoid RPC issues
    this.readOnlyContract = new Contract(CONTRACT_ADDRESS, SafeSendABI.abi, provider)
  }

  // Helper function to generate password hash
  static hashPassword(password) {
    return keccak256(toUtf8Bytes(password))
  }

  // Get contract constants
  async getConstants() {
    try {
      console.log('Getting contract constants...')
      console.log('Contract address:', CONTRACT_ADDRESS)
      console.log('Contract ABI:', SafeSendABI.abi)
      
      const [notificationAmount, minDeposit, nextDepositId, platformFeePercentage, collectedFees] = await Promise.all([
        this.readOnlyContract.NOTIFICATION_AMOUNT(),
        this.readOnlyContract.MIN_DEPOSIT(),
        this.readOnlyContract.nextDepositId(),
        this.readOnlyContract.PLATFORM_FEE_PERCENTAGE(),
        this.readOnlyContract.getCollectedFees()
      ])

      return {
        notificationAmount: formatEther(notificationAmount),
        minDeposit: formatEther(minDeposit),
        nextDepositId: nextDepositId.toString(),
        platformFeePercentage: platformFeePercentage.toString(),
        platformFeePercent: (Number(platformFeePercentage) / 100).toFixed(1), // Convert basis points to percentage
        collectedFees: formatEther(collectedFees)
      }
    } catch (error) {
      console.error('Error getting constants:', error)
      throw error
    }
  }

  // Create a new deposit
  async createDeposit(recipientAddress, password, expiryMinutes, ethAmount) {
    try {
      // Validate network
      const network = await this.provider.getNetwork()
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        throw new Error('Please switch to Sepolia testnet')
      }

      // Generate password hash
      const passwordHash = ContractService.hashPassword(password)
      
      // Convert ETH amount to wei
      const value = parseEther(ethAmount.toString())
      
      // Skip minimum deposit check for now due to RPC issues
      // const constants = await this.getConstants()
      // const minDepositWei = parseEther(constants.minDeposit)
      
      // if (value < minDepositWei) {
      //   throw new Error(`Minimum deposit is ${constants.minDeposit} ETH`)
      // }

      console.log('Creating deposit:', {
        recipient: recipientAddress,
        passwordHash,
        expiryMinutes,
        value: ethAmount + ' ETH',
        valueInWei: value.toString(),
        contractAddress: this.contract.target
      })

      // Call contract function
      const tx = await this.contract.createDeposit(
        recipientAddress,
        passwordHash,
        expiryMinutes,
        { value }
      )

      console.log('Transaction sent:', tx.hash)
      
      // Wait for confirmation
      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)
      console.log('Gas used:', receipt.gasUsed.toString())
      console.log('Transaction logs:', receipt.logs.length)

      // Extract deposit ID from events
      const depositCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log)
          return parsed.name === 'DepositCreated'
        } catch {
          return false
        }
      })

      if (depositCreatedEvent) {
        const parsed = this.contract.interface.parseLog(depositCreatedEvent)
        const depositId = parsed.args[0].toString()
        
        return {
          success: true,
          txHash: tx.hash,
          depositId,
          gasUsed: receipt.gasUsed.toString()
        }
      }

      return {
        success: true,
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      }

    } catch (error) {
      console.error('Error creating deposit:', error)
      throw error
    }
  }

  // Get deposit details
  async getDeposit(depositId) {
    try {
      const deposit = await this.readOnlyContract.getDeposit(depositId)
      
      return {
        depositor: deposit[0],
        recipient: deposit[1],
        passwordHash: deposit[2],
        amount: formatEther(deposit[3]),
        expiryTime: new Date(Number(deposit[4]) * 1000),
        claimed: deposit[5],
        cancelled: deposit[6]
      }
    } catch (error) {
      console.error('Error getting deposit:', error)
      throw error
    }
  }

  // Check if deposit exists
  async depositExists(depositId) {
    try {
      const deposit = await this.readOnlyContract.getDeposit(depositId)
      return deposit[0] !== '0x0000000000000000000000000000000000000000'
    } catch (error) {
      return false
    }
  }

  // Check if deposit is expired
  async isExpired(depositId) {
    try {
      return await this.readOnlyContract.isExpired(depositId)
    } catch (error) {
      console.error('Error checking expiry:', error)
      throw error
    }
  }

  // Claim a deposit
  async claimDeposit(depositId, password) {
    try {
      // Validate network
      const network = await this.provider.getNetwork()
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        throw new Error('Please switch to Sepolia testnet')
      }

      console.log('Claiming deposit:', { depositId, password })

      // Call contract function
      const tx = await this.contract.claim(depositId, password)
      console.log('Claim transaction sent:', tx.hash)
      
      // Wait for confirmation
      const receipt = await tx.wait()
      console.log('Claim transaction confirmed:', receipt)

      return {
        success: true,
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      }

    } catch (error) {
      console.error('Error claiming deposit:', error)
      throw error
    }
  }

  // Cancel a deposit
  async cancelDeposit(depositId) {
    try {
      // Validate network
      const network = await this.provider.getNetwork()
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        throw new Error('Please switch to Sepolia testnet')
      }

      console.log('Cancelling deposit:', depositId)

      // Call contract function
      const tx = await this.contract.cancel(depositId)
      console.log('Cancel transaction sent:', tx.hash)
      
      // Wait for confirmation
      const receipt = await tx.wait()
      console.log('Cancel transaction confirmed:', receipt)

      return {
        success: true,
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      }

    } catch (error) {
      console.error('Error cancelling deposit:', error)
      throw error
    }
  }

  // Get current block timestamp
  async getCurrentTime() {
    try {
      return await this.readOnlyContract.getCurrentTime()
    } catch (error) {
      console.error('Error getting current time:', error)
      throw error
    }
  }

  // Get deposits for a specific depositor (sender)
  async getDepositsForUser(userAddress) {
    try {
      const deposits = []
      
      // Get the next deposit ID to know how many deposits exist
      const nextDepositId = await this.readOnlyContract.nextDepositId()
      console.log('Total deposits to check:', nextDepositId.toString())
      
      // Check each deposit to see if it belongs to the user
      for (let i = 0; i < Number(nextDepositId); i++) {
        try {
          const deposit = await this.getDeposit(i)
          
          // If this deposit was created by the user, add it to the list
          if (deposit.depositor.toLowerCase() === userAddress.toLowerCase()) {
            const currentTime = Math.floor(Date.now() / 1000)
            const isExpired = currentTime > Math.floor(deposit.expiryTime.getTime() / 1000)
            
            deposits.push({
              id: i,
              ...deposit,
              isExpired,
              canCancel: !deposit.claimed && !deposit.cancelled
            })
          }
        } catch (error) {
          console.log(`Deposit ${i} doesn't exist or error fetching:`, error.message)
        }
      }
      
      return deposits
    } catch (error) {
      console.error('Error getting user deposits:', error)
      throw error
    }
  }

  // Get all deposits for a user (both sent and received)
  async getAllDepositsForUser(userAddress) {
    try {
      const deposits = []
      
      // Get the next deposit ID to know how many deposits exist
      const nextDepositId = await this.readOnlyContract.nextDepositId()
      console.log('Total deposits to check:', nextDepositId.toString())
      
      // Check each deposit to see if it involves the user
      for (let i = 0; i < Number(nextDepositId); i++) {
        try {
          const deposit = await this.getDeposit(i)
          
          // If this deposit was created by the user OR sent to the user, add it to the list
          if (deposit.depositor.toLowerCase() === userAddress.toLowerCase() || 
              deposit.recipient.toLowerCase() === userAddress.toLowerCase()) {
            const currentTime = Math.floor(Date.now() / 1000)
            const expiryTimestamp = Math.floor(deposit.expiryTime.getTime() / 1000)
            const isExpired = currentTime > expiryTimestamp
            const isRecipient = deposit.recipient.toLowerCase() === userAddress.toLowerCase()
            const isDepositor = deposit.depositor.toLowerCase() === userAddress.toLowerCase()
            
            const depositData = {
              id: i,
              ...deposit,
              isExpired,
              canCancel: !deposit.claimed && !deposit.cancelled && isDepositor,
              canClaim: !deposit.claimed && !deposit.cancelled && !isExpired && isRecipient,
              type: isDepositor ? 'sent' : 'received'
            }
            
            console.log(`Deposit ${i} for user ${userAddress}:`, {
              depositor: deposit.depositor,
              recipient: deposit.recipient,
              claimed: deposit.claimed,
              cancelled: deposit.cancelled,
              isExpired,
              canClaim: depositData.canClaim,
              canCancel: depositData.canCancel,
              type: depositData.type
            })
            
            deposits.push(depositData)
          }
        } catch (error) {
          console.log(`Deposit ${i} doesn't exist or error fetching:`, error.message)
        }
      }
      
      // Sort by deposit ID (newest first)
      return deposits.sort((a, b) => b.id - a.id)
    } catch (error) {
      console.error('Error getting all user deposits:', error)
      throw error
    }
  }
}

export default ContractService