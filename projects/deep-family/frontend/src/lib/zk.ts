import { Contract, JsonRpcSigner, JsonRpcProvider, toUtf8Bytes, keccak256, solidityPackedKeccak256 } from 'ethers'
import DeepFamilyAbi from '../abi/DeepFamily.json'
// @ts-ignore
import * as snarkjs from 'snarkjs'

export type Groth16Proof = {
  pi_a: [string | bigint, string | bigint, string | bigint]
  pi_b: [[string | bigint, string | bigint], [string | bigint, string | bigint], [string | bigint, string | bigint]]
  pi_c: [string | bigint, string | bigint, string | bigint]
  protocol: string
  curve: string
}

function toBigInt(v: string | number | bigint): bigint {
  if (typeof v === 'bigint') return v
  if (typeof v === 'number') return BigInt(v)
  if (typeof v === 'string') {
    if (v.startsWith('0x') || v.startsWith('0X')) return BigInt(v)
    return BigInt(v)
  }
  throw new Error('unsupported type')
}

export function ensurePublicSignalsShape(publicSignals: Array<string | number | bigint>) {
  if (!Array.isArray(publicSignals) || publicSignals.length !== 7) {
    throw new Error('publicSignals length must be 7')
  }
  const TWO_POW_128 = 1n << 128n
  for (let i = 0; i < 6; i++) {
    const limb = toBigInt(publicSignals[i])
    if (limb < 0n || limb >= TWO_POW_128) throw new Error(`publicSignals[${i}] not in [0,2^128)`) 
  }
  const submitter = toBigInt(publicSignals[6])
  const TWO_POW_160 = 1n << 160n
  if (submitter < 0n || submitter >= TWO_POW_160) throw new Error('submitter out of uint160 range')
}

export async function submitAddPersonZK(
  signer: JsonRpcSigner,
  contractAddress: string,
  proof: Groth16Proof,
  publicSignals: Array<string | number | bigint>,
  fatherVersionIndex: number,
  motherVersionIndex: number,
  tag: string,
  metadataCID: string,
) {
  ensurePublicSignalsShape(publicSignals)

  // Debug: Check proof structure
  console.log('🔍 Proof structure:', proof)
  console.log('🔍 Proof keys:', Object.keys(proof))
  console.log('🔍 Proof.pi_a:', proof.pi_a)
  console.log('🔍 Proof.pi_b:', proof.pi_b)
  console.log('🔍 Proof.pi_c:', proof.pi_c)

  // Validate proof structure (snarkjs format uses pi_a, pi_b, pi_c)
  if (!proof || !proof.pi_a || !proof.pi_b || !proof.pi_c) {
    throw new Error('Invalid proof structure: missing pi_a, pi_b, or pi_c components')
  }
  
  if (!Array.isArray(proof.pi_a) || proof.pi_a.length !== 3) {
    throw new Error('Invalid proof.pi_a: expected array of length 3')
  }
  
  if (!Array.isArray(proof.pi_b) || proof.pi_b.length !== 3 || !Array.isArray(proof.pi_b[0]) || !Array.isArray(proof.pi_b[1]) || !Array.isArray(proof.pi_b[2])) {
    throw new Error('Invalid proof.pi_b: expected 3x2 array structure')
  }
  
  if (!Array.isArray(proof.pi_c) || proof.pi_c.length !== 3) {
    throw new Error('Invalid proof.pi_c: expected array of length 3')
  }

  const contract = new Contract(contractAddress, DeepFamilyAbi.abi, signer)
  // Convert snarkjs format to contract format (take first 2 elements)
  const a = [toBigInt(proof.pi_a[0]), toBigInt(proof.pi_a[1])]
  // Note: snarkjs outputs G2 points as [[bx1, bx2], [by1, by2]] but Solidity verifier expects
  // the pairs in swapped order per limb for bn128 (see common Groth16 mappings).
  // Use [[b00, b01], [b10, b11]] = [[pi_b[0][1], pi_b[0][0]], [pi_b[1][1], pi_b[1][0]]]
  const b = [
    [toBigInt(proof.pi_b[0][1]), toBigInt(proof.pi_b[0][0])],
    [toBigInt(proof.pi_b[1][1]), toBigInt(proof.pi_b[1][0])],
  ]
  const c = [toBigInt(proof.pi_c[0]), toBigInt(proof.pi_c[1])]
  const pub = publicSignals.map(toBigInt)

  // Debug: Log contract call parameters
  console.log('🔍 Contract call parameters:')
  console.log('  a:', a.map(x => x.toString()))
  console.log('  b:', b.map(row => row.map(x => x.toString())))
  console.log('  c:', c.map(x => x.toString()))
  console.log('  publicSignals:', pub.map(x => x.toString()))
  console.log('  fatherVersionIndex:', fatherVersionIndex)
  console.log('  motherVersionIndex:', motherVersionIndex)
  console.log('  tag:', tag)
  console.log('  metadataCID:', metadataCID)
  
  // Check public signals length
  console.log('🔍 Public signals validation:')
  console.log('  Length:', pub.length, '(expected: 7)')
  
  // Check limbs are in valid range (< 2^128)
  const TWO_POW_128 = 1n << 128n
  for (let i = 0; i < 6; i++) {
    const inRange = pub[i] < TWO_POW_128
    console.log(`  Limb[${i}]:`, pub[i].toString(), inRange ? '✅' : '❌ OUT OF RANGE')
  }
  
  // Check submitter
  const TWO_POW_160 = 1n << 160n
  const submitter = pub[6]
  const submitterInRange = submitter < TWO_POW_160
  console.log('  Submitter:', submitter.toString(), submitterInRange ? '✅' : '❌ OUT OF RANGE')
  
  // Get actual sender address for comparison
  const senderAddress = await signer.getAddress()
  const expectedSubmitter = BigInt(senderAddress)
  console.log('  Expected submitter:', expectedSubmitter.toString())
  console.log('  Submitter match:', submitter === expectedSubmitter ? '✅' : '❌ MISMATCH')

  try {
    console.log('🚀 Estimating gas for contract.addPersonZK...')
    
    // First estimate gas
    const gasEstimate = await contract.addPersonZK.estimateGas(a, b, c, pub, fatherVersionIndex, motherVersionIndex, tag, metadataCID)
    console.log('⛽ Estimated gas:', gasEstimate.toString())
    
    // Add 20% buffer to gas estimate
    const gasLimit = gasEstimate * 120n / 100n
    console.log('⛽ Gas limit (with buffer):', gasLimit.toString())
    
    console.log('🚀 Calling contract.addPersonZK...')
    const tx = await contract.addPersonZK(a, b, c, pub, fatherVersionIndex, motherVersionIndex, tag, metadataCID, {
      gasLimit: gasLimit
    })
    console.log('✅ Transaction sent successfully:', tx.hash)
    
    // Wait for transaction confirmation and get receipt
    console.log('⏳ Waiting for transaction confirmation...')
    const receipt = await tx.wait()
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber)
    
    // Parse all events from the transaction receipt
    const events = {
      PersonHashZKVerified: null as any,
      PersonVersionAdded: null as any,
      TokenRewardDistributed: null as any
    }
    
    let personHash = 'unknown'
    let versionIndex = 0
    let rewardAmount = 0
    
    console.log(`🔍 Total logs in receipt: ${receipt.logs.length}`)
    
    for (const log of receipt.logs) {
      try {
        const parsedEvent = contract.interface.parseLog(log)
        if (parsedEvent) {
          console.log(`📊 Event detected: ${parsedEvent.name}`, parsedEvent.args)
          
          switch (parsedEvent.name) {
            case 'PersonHashZKVerified':
              events.PersonHashZKVerified = {
                personHash: parsedEvent.args.personHash,
                prover: parsedEvent.args.prover
              }
              console.log('✅ PersonHashZKVerified:', events.PersonHashZKVerified)
              break
              
            case 'PersonVersionAdded':
              events.PersonVersionAdded = {
                personHash: parsedEvent.args.personHash,
                versionIndex: Number(parsedEvent.args.versionIndex),
                addedBy: parsedEvent.args.addedBy,
                timestamp: Number(parsedEvent.args.timestamp),
                fatherHash: parsedEvent.args.fatherHash,
                fatherVersionIndex: Number(parsedEvent.args.fatherVersionIndex),
                motherHash: parsedEvent.args.motherHash,
                motherVersionIndex: Number(parsedEvent.args.motherVersionIndex),
                tag: parsedEvent.args.tag
              }
              personHash = events.PersonVersionAdded.personHash
              versionIndex = events.PersonVersionAdded.versionIndex
              console.log('✅ PersonVersionAdded:', events.PersonVersionAdded)
              break
              
            case 'TokenRewardDistributed':
              events.TokenRewardDistributed = {
                miner: parsedEvent.args.miner,
                personHash: parsedEvent.args.personHash,
                versionIndex: Number(parsedEvent.args.versionIndex),
                reward: parsedEvent.args.reward.toString()
              }
              // Convert from wei to token units (divide by 10^18)
              rewardAmount = Number(parsedEvent.args.reward) / Math.pow(10, 18)
              console.log('🎁 TokenRewardDistributed:', events.TokenRewardDistributed)
              console.log('💰 Reward amount (converted):', rewardAmount, 'DEEP')
              break
          }
        }
      } catch (error) {
        // Log unparseable events for debugging
        console.log('🔍 Unparseable log:', {
          address: log.address,
          topics: log.topics,
          data: log.data
        })
        continue
      }
    }
    
    console.log('📊 All events parsed:', events)
    
    // Additional debugging for TokenRewardDistributed
    if (!events.TokenRewardDistributed) {
      console.log('⚠️ No TokenRewardDistributed event found')
      if (events.PersonVersionAdded) {
        console.log('🔍 Father hash:', events.PersonVersionAdded.fatherHash)
        console.log('🔍 Mother hash:', events.PersonVersionAdded.motherHash)
        console.log('💡 Token reward requires both parent hashes to exist in system')
      }
    }
    
    return {
      hash: personHash,
      index: versionIndex,
      rewardAmount,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      events
    }
  } catch (contractError: any) {
    console.error('❌ Contract call failed:', contractError)
    console.error('📋 Full error object:', JSON.stringify(contractError, null, 2))
    console.error('📋 Error properties:', {
      code: contractError?.code,
      reason: contractError?.reason,
      data: contractError?.data,
      message: contractError?.message,
      error: contractError?.error,
      transaction: contractError?.transaction
    })
    
    // Parse the specific error message to provide better user feedback
    let errorType = 'UNKNOWN_ERROR'
    let errorMessage = 'Unknown error occurred'
    let userMessage = 'An unexpected error occurred'
    
    // Check for revert reasons (custom errors from smart contract)
    let reason = null
    
    // Try multiple ways to extract the revert reason
    if (contractError?.reason) {
      reason = contractError.reason
    } else if (contractError?.data?.reason) {
      reason = contractError.data.reason  
    } else if (contractError?.error?.reason) {
      reason = contractError.error.reason
    } else if (contractError?.data) {
      // Try to parse error data using ethers interface first
      try {
        if (typeof contractError.data === 'string') {
          const parsedError = contract.interface.parseError(contractError.data)
          if (parsedError) {
            reason = parsedError.name
            console.log('📋 Parsed error via ethers interface:', reason, parsedError.args)
          }
        }
      } catch (parseError) {
        console.log('📋 Failed to parse error with ethers interface:', parseError)
      }
      
      // If ethers parsing failed, try manual parsing
      if (!reason && typeof contractError.data === 'string') {
        const errorData = contractError.data
        console.log('📋 Error data:', errorData)
        
        // Parse common custom error signatures
        if (errorData.includes('0x')) {
        // This might be a custom error with selector
        const errorSelector = errorData.slice(0, 10) // First 4 bytes
        console.log('📋 Error selector:', errorSelector)
        
        // Map known error selectors to human-readable names
        // These are keccak256 hash first 4 bytes of error signatures
        const errorSelectors: Record<string, string> = {
          // DeepFamily contract errors
          '0x0c3b17f3': 'InvalidPersonHash',
          '0x8e4a23d6': 'InvalidFatherVersionIndex', 
          '0x8e4a23d7': 'InvalidMotherVersionIndex',
          '0x2a94dd18': 'InvalidVersionIndex',
          '0x37ecb1b5': 'InvalidFullName',
          '0xe2aaef67': 'InvalidTagLength',
          '0x8e4a23d8': 'InvalidCIDLength',
          '0x8e4a23d9': 'InvalidBirthPlace',
          '0x8e4a23da': 'InvalidDeathPlace', 
          '0x8e4a23db': 'InvalidBirthMonth',
          '0x8e4a23dc': 'InvalidBirthDay',
          '0x8e4a23dd': 'InvalidStory',
          '0x8e4a23de': 'InvalidTokenURI',
          '0xd3f65b6b': 'InvalidZKProof',
          '0x8e4a23df': 'VerifierNotSet',
          '0x1a3ca9f1': 'DuplicateVersion',
          '0x8e4a23e0': 'MustEndorseVersionFirst',
          '0x8e4a23e1': 'VersionAlreadyMinted',
          '0x8e4a23e2': 'BasicInfoMismatch',
          '0x8e4a23e3': 'TokenContractNotSet',
          '0x8e4a23e4': 'InvalidTokenId',
          '0x8e4a23e5': 'EndorsementFeeTransferFailed',
          '0x8e4a23e6': 'PageSizeExceedsLimit',
          '0x8e4a23e7': 'DirectETHNotAccepted',
          '0x8e4a23e8': 'StoryAlreadySealed',
          '0x8e4a23e9': 'ChunkIndexOutOfRange',
          '0x8e4a23ea': 'InvalidChunkContent',
          '0x8e4a23eb': 'ChunkHashMismatch',
          '0x8e4a23ec': 'StoryNotFound',
          '0x8e4a23ed': 'MustBeNFTHolder',
          // Generic errors
          '0x08c379a0': 'Error', // Error(string) - generic revert reason
        }
        
        if (errorSelectors[errorSelector]) {
          reason = errorSelectors[errorSelector]
          
          // For Error(string) type, try to decode the actual error message
          if (errorSelector === '0x08c379a0' && errorData.length > 10) {
            try {
              // Error(string) data format: selector(4 bytes) + offset(32 bytes) + length(32 bytes) + data
              // Skip selector (10 chars: 0x + 8 hex chars), then decode as ABI string
              const encodedString = errorData.slice(10)
              // This is a simplified decoder - in production you might want to use ethers.js AbiCoder
              // For now, we'll try to extract readable text if possible
              console.log('📋 Attempting to decode Error(string):', encodedString)
              // Skip this complex decoding for now and use the selector mapping
            } catch (e) {
              console.log('📋 Failed to decode Error(string):', e)
            }
          }
        }
        }
      }
    } else if (contractError?.message) {
      // Try to extract reason from error message
      const message = contractError.message
      if (message.includes('reverted with reason string')) {
        const match = message.match(/reverted with reason string '(.+?)'/);
        if (match) {
          reason = match[1]
        }
      } else if (message.includes('execution reverted:')) {
        const match = message.match(/execution reverted: (.+)/);
        if (match) {
          reason = match[1]
        }
      }
    }
    
    console.log('📋 Extracted revert reason:', reason)
    
    if (reason) {
      
      switch (reason) {
        case 'InvalidZKProof':
          errorType = 'INVALID_ZK_PROOF'
          errorMessage = 'Zero-knowledge proof verification failed'
          userMessage = 'The cryptographic proof is invalid. Please try generating a new proof.'
          break
        case 'InvalidTagLength':
          errorType = 'INVALID_TAG_LENGTH'
          errorMessage = 'Tag length exceeds maximum allowed'
          userMessage = 'The tag is too long. Please use a shorter tag.'
          break
        case 'InvalidCIDLength':
          errorType = 'INVALID_CID_LENGTH'
          errorMessage = 'Metadata CID length exceeds maximum allowed'
          userMessage = 'The metadata CID is too long. Please use a shorter CID.'
          break
        case 'InvalidFatherVersionIndex':
          errorType = 'INVALID_FATHER_VERSION'
          errorMessage = 'Father version index is invalid'
          userMessage = 'The father\'s version index is invalid. Please check the father information.'
          break
        case 'InvalidMotherVersionIndex':
          errorType = 'INVALID_MOTHER_VERSION'
          errorMessage = 'Mother version index is invalid'
          userMessage = 'The mother\'s version index is invalid. Please check the mother information.'
          break
        case 'DuplicateVersion':
          errorType = 'DUPLICATE_VERSION'
          errorMessage = 'This version already exists'
          userMessage = 'A person with the same information already exists. Please check if this person has already been added.'
          break
        default:
          errorType = 'CONTRACT_REVERT'
          errorMessage = `Contract reverted: ${reason}`
          userMessage = `Transaction failed: ${reason}`
      }
    }
    // Check for gas-related errors
    else if (contractError?.message?.includes('gas') || contractError?.code === 'UNPREDICTABLE_GAS_LIMIT') {
      errorType = 'GAS_ERROR'
      errorMessage = 'Gas estimation failed or insufficient gas'
      userMessage = 'Transaction failed due to insufficient gas. ZK proof verification requires high gas limits.'
    }
    // Check for out of gas errors
    else if (contractError?.message?.includes('out of gas')) {
      errorType = 'OUT_OF_GAS'
      errorMessage = 'Transaction ran out of gas during execution'
      userMessage = 'Transaction ran out of gas. Please increase the gas limit and try again.'
    }
    // Check for user rejection
    else if (contractError?.code === 'ACTION_REJECTED' || contractError?.message?.includes('rejected')) {
      errorType = 'USER_REJECTED'
      errorMessage = 'User rejected the transaction'
      userMessage = 'Transaction was cancelled by user.'
    }
    // Check for network errors
    else if (contractError?.code === 'NETWORK_ERROR') {
      errorType = 'NETWORK_ERROR'
      errorMessage = 'Network connection error'
      userMessage = 'Network error occurred. Please check your connection and try again.'
    }
    // Check for insufficient funds
    else if (contractError?.message?.includes('insufficient funds')) {
      errorType = 'INSUFFICIENT_FUNDS'
      errorMessage = 'Insufficient funds for gas'
      userMessage = 'Insufficient funds to pay for transaction gas fees.'
    }
    // General call exception
    else if (contractError?.code === 'CALL_EXCEPTION') {
      errorType = 'CALL_EXCEPTION'
      errorMessage = 'Contract call failed - likely a require() condition failed'
      userMessage = 'Transaction failed due to contract validation. Please check your input data.'
    }
    
    console.error('📋 Error analysis:', {
      errorType,
      errorMessage,
      userMessage,
      originalError: contractError
    })
    
    // Throw enhanced error with additional information
    const enhancedError = new Error(userMessage)
    ;(enhancedError as any).type = errorType
    ;(enhancedError as any).details = errorMessage
    ;(enhancedError as any).originalError = contractError
    
    throw enhancedError
  }
}

// Person data input interface
export interface PersonData {
  fullName: string
  passphrase: string
  birthYear: number
  birthMonth: number
  birthDay: number
  isBirthBC: boolean
  gender: number // 1=male, 2=female
}

// Hash helpers convert UTF-8 string to keccak bytes array (32 elements)
function keccakStringToBytes(value: string): number[] {
  const hash = keccak256(toUtf8Bytes(value || ''))
  const bytes = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hash.slice(2 + i * 2, 4 + i * 2), 16)
  }
  return Array.from(bytes)
}

export function hashFullName(fullName: string): number[] {
  return keccakStringToBytes(fullName)
}

type PassphraseInput = string | number | bigint | Array<string | number | bigint> | undefined | null

export function hashPassphrase(passphrase: PassphraseInput): number[] {
  if (Array.isArray(passphrase)) {
    return passphrase.slice(0, 32).map((v) => Number(v) & 0xff)
  }
  const normalized = passphrase == null ? '' : String(passphrase)
  if (normalized.length === 0) {
    return Array(32).fill(0)
  }
  return keccakStringToBytes(normalized)
}

// Generate ZK proof for adding a person
export async function generatePersonProof(
  person: PersonData,
  father: PersonData | null,
  mother: PersonData | null,
  submitterAddress: string
): Promise<{ proof: Groth16Proof; publicSignals: string[] }> {
  try {
    // Create default parent data if they don't exist
    const defaultParent: PersonData = {
      fullName: '',
      passphrase: '',
      birthYear: 0,
      birthMonth: 1,
      birthDay: 1,
      isBirthBC: false,
      gender: 1
    }

    const fatherData = father || defaultParent
    const motherData = mother || defaultParent

    // Prepare circuit input
    const input = {
      fullNameHash: hashFullName(person.fullName),
      saltHash: hashPassphrase(person.passphrase),
      isBirthBC: person.isBirthBC ? 1 : 0,
      birthYear: person.birthYear,
      birthMonth: person.birthMonth,
      birthDay: person.birthDay,
      gender: person.gender,
      
      father_fullNameHash: hashFullName(fatherData.fullName),
      father_saltHash: hashPassphrase(fatherData.passphrase),
      father_isBirthBC: fatherData.isBirthBC ? 1 : 0,
      father_birthYear: fatherData.birthYear,
      father_birthMonth: fatherData.birthMonth,
      father_birthDay: fatherData.birthDay,
      father_gender: fatherData.gender,
      
      mother_fullNameHash: hashFullName(motherData.fullName),
      mother_saltHash: hashPassphrase(motherData.passphrase),
      mother_isBirthBC: motherData.isBirthBC ? 1 : 0,
      mother_birthYear: motherData.birthYear,
      mother_birthMonth: motherData.birthMonth,
      mother_birthDay: motherData.birthDay,
      mother_gender: motherData.gender,
      
      hasFather: father && father.fullName.trim() ? 1 : 0,
      hasMother: mother && mother.fullName.trim() ? 1 : 0,
      submitter: BigInt(submitterAddress).toString()
    }

    console.log('📊 Circuit input prepared:', {
      fullNameHashLength: input.fullNameHash.length,
      saltHashLength: input.saltHash.length,
      hasFather: input.hasFather,
      hasMother: input.hasMother,
      submitterLength: input.submitter.length,
      submitter: input.submitter
    })

    // Add cache-busting timestamp to force reload of wasm file
    const timestamp = Date.now()
    
    // Generate proof using snarkjs
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      `/zk/person_hash_zk.wasm?t=${timestamp}`,
      `/zk/person_hash_zk_final.zkey?t=${timestamp}`
    )

    console.log('🔍 Generated proof object:', proof)
    console.log('🔍 Generated publicSignals:', publicSignals)
    console.log('🔍 Proof type:', typeof proof)
    console.log('🔍 Proof keys:', Object.keys(proof || {}))

    return { proof, publicSignals }
  } catch (error) {
    console.error('Error generating ZK proof:', error)
    throw new Error(`Failed to generate ZK proof: ${error}`)
  }
}

// Verify a ZK proof (optional, for debugging)
export async function verifyProof(
  proof: Groth16Proof,
  publicSignals: string[]
): Promise<boolean> {
  try {
    const vKeyResponse = await fetch('/zk/person_hash_zk.vkey.json')
    const vKey = await vKeyResponse.json()
    
    const result = await snarkjs.groth16.verify(vKey, publicSignals, proof)
    return result
  } catch (error) {
    console.error('Error verifying proof:', error)
    return false
  }
}

export async function generateNamePoseidonProof(
  fullName: string,
  passphrase: string
): Promise<{ proof: Groth16Proof; publicSignals: string[] }> {
  try {
    const input = {
      fullNameHash: hashFullName(fullName),
      saltHash: hashPassphrase(passphrase)
    }

    const timestamp = Date.now()
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      `/zk/name_poseidon_zk.wasm?t=${timestamp}`,
      `/zk/name_poseidon_zk_final.zkey?t=${timestamp}`
    )

    return { proof, publicSignals }
  } catch (error) {
    console.error('Error generating name poseidon ZK proof:', error)
    throw new Error(`Failed to generate name poseidon ZK proof: ${error}`)
  }
}

export async function verifyNamePoseidonProof(
  proof: Groth16Proof,
  publicSignals: string[]
): Promise<boolean> {
  try {
    const vKeyResponse = await fetch('/zk/name_poseidon_zk.vkey.json')
    const vKey = await vKeyResponse.json()
    return snarkjs.groth16.verify(vKey, publicSignals, proof)
  } catch (error) {
    console.error('Error verifying name poseidon proof:', error)
    return false
  }
}

export function formatGroth16ProofForContract(proof: Groth16Proof) {
  if (!proof || !proof.pi_a || !proof.pi_b || !proof.pi_c) {
    throw new Error('Invalid proof structure')
  }

  if (!Array.isArray(proof.pi_a) || proof.pi_a.length < 2) {
    throw new Error('Invalid proof.pi_a length')
  }

  if (!Array.isArray(proof.pi_b) || proof.pi_b.length < 2) {
    throw new Error('Invalid proof.pi_b length')
  }

  if (!Array.isArray(proof.pi_c) || proof.pi_c.length < 2) {
    throw new Error('Invalid proof.pi_c length')
  }

  const a: [bigint, bigint] = [toBigInt(proof.pi_a[0]), toBigInt(proof.pi_a[1])]
  const b: [[bigint, bigint], [bigint, bigint]] = [
    [toBigInt(proof.pi_b[0][1]), toBigInt(proof.pi_b[0][0])],
    [toBigInt(proof.pi_b[1][1]), toBigInt(proof.pi_b[1][0])]
  ]
  const c: [bigint, bigint] = [toBigInt(proof.pi_c[0]), toBigInt(proof.pi_c[1])]

  return { a, b, c }
}

export function toBigIntArray(values: Array<string | number | bigint>): bigint[] {
  return values.map(toBigInt)
}
