import { useMemo, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWallet } from '../context/WalletContext'
import { useConfig } from '../context/ConfigContext'
import { useToast } from '../components/ToastProvider'
import { useTranslation } from 'react-i18next'
import DeepFamily from '../abi/DeepFamily.json'

export function useContract() {
  const { signer, provider } = useWallet()
  const { contractAddress } = useConfig()
  const toast = useToast()
  const { t } = useTranslation()

  const contract = useMemo(() => {
    if (!contractAddress) return null
    
    if (signer) {
      // Write operations with signer
      return new ethers.Contract(contractAddress, DeepFamily.abi, signer)
    } else if (provider) {
      // Read-only operations with provider
      return new ethers.Contract(contractAddress, DeepFamily.abi, provider)
    }
    
    return null
  }, [contractAddress, signer, provider])

  const executeTransaction = useCallback(async (
    contractMethod: () => Promise<any>,
    options: {
      onSuccess?: (result: any) => void
      onError?: (error: any) => void
      successMessage?: string
      errorMessage?: string
      suppressErrorToast?: boolean
    } = {}
  ) => {
    if (!contract || !signer) {
      toast.show(t('wallet.notConnected', 'Please connect your wallet'))
      return null
    }

    try {
      console.log('🔄 Calling contract method...')

      // Debug wallet and network state
      if (signer && signer.provider) {
        try {
          const network = await signer.provider.getNetwork()
          const signerAddress = await signer.getAddress()
          const balance = await signer.provider.getBalance(signerAddress)
          console.log('🔍 Wallet state:', {
            network: network.name || `Chain ID: ${network.chainId}`,
            signerAddress,
            balance: ethers.formatEther(balance),
            providerConnected: !!signer.provider
          })
        } catch (walletStateError) {
          console.warn('Failed to get wallet state:', walletStateError)
        }
      }

      // Add a small delay to prevent nonce conflicts with rapid successive transactions
      await new Promise(resolve => setTimeout(resolve, 100))

      // Add timeout for wallet popup interaction (30 seconds)
      const walletTimeout = 30000
      console.log(`⏰ Setting ${walletTimeout/1000}s timeout for wallet confirmation...`)

      const contractPromise = contractMethod()

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('WALLET_POPUP_TIMEOUT: Wallet confirmation timed out. Please check if the wallet popup was closed or hidden.'))
        }, walletTimeout)
      })

      console.log('🏁 Racing between contract call and timeout...')

      // Add window focus detection to catch when user switches away
      let windowBlurred = false
      const onBlur = () => {
        windowBlurred = true
        console.warn('🔍 Window lost focus - user may have switched to wallet or other app')
      }
      const onFocus = () => {
        if (windowBlurred) {
          console.log('✅ Window regained focus - user returned')
          windowBlurred = false
        }
      }

      window.addEventListener('blur', onBlur)
      window.addEventListener('focus', onFocus)

      let tx
      try {
        tx = await Promise.race([contractPromise, timeoutPromise])
        console.log('📤 Transaction sent:', { hash: tx.hash, nonce: tx.nonce })
      } finally {
        window.removeEventListener('blur', onBlur)
        window.removeEventListener('focus', onFocus)
      }

      toast.show(t('transaction.submitted', 'Transaction submitted...'))

      console.log('⏳ Waiting for transaction confirmation...')
      const receipt = await tx.wait()
      console.log('✅ Transaction confirmed:', { hash: receipt.hash, blockNumber: receipt.blockNumber, status: receipt.status })

      const successMsg = options.successMessage || t('transaction.success', 'Transaction successful')
      toast.show(successMsg)

      options.onSuccess?.(receipt)
      return receipt
    } catch (error: any) {
      console.error('Transaction failed:', error)

      // Log detailed error information for debugging wallet hang issues
      console.log('Error details:', {
        code: error.code,
        action: error.action,
        reason: error.reason,
        message: error.message,
        shortMessage: error.shortMessage,
        isUserRejection: error.code === 'ACTION_REJECTED' || error.code === 4001 ||
                        error.message?.includes('user rejected') ||
                        error.message?.includes('User denied'),
        errorInfo: error.info,
        errorData: error.data
      })
      
      let errorMsg = options.errorMessage || t('transaction.failed', 'Transaction failed')
      
      // Parse specific error messages
      let nestedMsg = error?.shortMessage || error?.info?.error?.message || error?.data?.message || error?.error?.message
      let errorName = error?.errorName || error?.info?.error?.name
      const baseMsg = error?.message || ''

      // Attempt to decode revert data via ABI for custom errors
      let customError = errorName as string | undefined
      const iface = contract?.interface as any
      const candidates: string[] = []
      const pushHex = (v: any) => {
        if (typeof v === 'string' && v.startsWith('0x') && v.length >= 10) candidates.push(v)
      }
      try {
        pushHex(error?.data)
        pushHex(error?.data?.data)
        pushHex(error?.info?.error?.data)
        pushHex(error?.error?.data)
      } catch {}
      if (iface && candidates.length > 0) {
        for (const data of candidates) {
          try {
            const desc = iface.parseError(data)
            if (desc) {
              customError = String(desc.name)
              // Handle Error(string) to extract message
              if (!nestedMsg && desc.name === 'Error' && desc.args && desc.args.length > 0) {
                nestedMsg = String(desc.args[0])
              }
              break
            }
          } catch {}
        }
      }

      // Extract custom error from message if still unknown
      if (!customError && baseMsg) {
        const customErrorMatch = baseMsg.match(/reverted with custom error '([^']+)'/)
        if (customErrorMatch) customError = customErrorMatch[1].replace('()', '')
      }

      if (customError) {
        // Map known custom errors to friendly text
        const name = String(customError)
        if (/InvalidPersonHash|InvalidVersionIndex/.test(name)) {
          errorMsg = t('endorse.invalidTarget', 'Invalid person hash or version index')
        } else if (/EndorsementFeeTransferFailed|ERC20InsufficientAllowance/.test(name)) {
          errorMsg = t('endorse.needApprove', 'Allowance too low, please approve DEEP tokens again')
        } else if (/ERC20InsufficientBalance/.test(name)) {
          errorMsg = t('endorse.insufficientDeepTokens', 'Insufficient DEEP tokens for endorsement')
        } else if (/VersionAlreadyMinted/.test(name)) {
          errorMsg = t('mintNFT.errors.versionAlreadyMinted', 'This version has already been minted as NFT')
        } else if (/MustEndorseVersionFirst/.test(name)) {
          errorMsg = t('mintNFT.errors.mustEndorseFirst', 'You must endorse this version before minting')
        } else if (/BasicInfoMismatch/.test(name)) {
          errorMsg = t('mintNFT.errors.basicInfoMismatch', 'Person information does not match the version data')
        } else if (/InvalidTokenURI/.test(name)) {
          errorMsg = t('mintNFT.errors.invalidTokenURI', 'Invalid token URI format')
        } else if (/InvalidStory/.test(name)) {
          errorMsg = t('mintNFT.errors.invalidStory', 'Story content is too long')
        } else if (/InvalidBirthPlace/.test(name)) {
          errorMsg = t('mintNFT.errors.invalidBirthPlace', 'Birth place is too long')
        } else if (/InvalidDeathPlace/.test(name)) {
          errorMsg = t('mintNFT.errors.invalidDeathPlace', 'Death place is too long')
        } else {
          errorMsg = name
        }
      } else if (nestedMsg) {
        errorMsg = nestedMsg
      } else if (baseMsg) {
        if (baseMsg.includes('user rejected') || baseMsg.includes('ACTION_REJECTED')) {
          errorMsg = t('transaction.rejected', 'Transaction rejected by user')
        } else if (baseMsg.includes('insufficient funds')) {
          errorMsg = t('transaction.insufficientFunds', 'Insufficient funds')
        } else if (baseMsg.includes('WALLET_POPUP_TIMEOUT')) {
          errorMsg = t('transaction.walletTimeout', 'Wallet confirmation timed out. Please try again and make sure to confirm in the wallet popup.')
        } else {
          errorMsg = baseMsg
        }
      }
      
      toast.show(errorMsg)

      // Create enhanced error with parsed info
      const enhancedError = {
        ...error,
        parsedMessage: errorMsg,
        customError: customError,
        errorName: customError || errorName
      }

      options.onError?.(enhancedError)

      // Throw enhanced error so calling code can catch it
      throw enhancedError
    }
  }, [contract, signer, toast, t])

  // Contract interaction methods based on actual DeepFamily.sol functions

  const addPersonZK = useCallback(async (
    a: [bigint, bigint],
    b: [[bigint, bigint], [bigint, bigint]],
    c: [bigint, bigint],
    publicSignals: bigint[],
    fatherVersionIndex: bigint,
    motherVersionIndex: bigint,
    tag: string,
    metadataCID: string
  ) => {
    return executeTransaction(
      () => contract!.addPersonZK(a, b, c, publicSignals, fatherVersionIndex, motherVersionIndex, tag, metadataCID),
      {
        successMessage: t('contract.addVersionSuccess', 'Person version added successfully'),
        errorMessage: t('contract.addVersionFailed', 'Failed to add person version')
      }
    )
  }, [executeTransaction, t, contract])

  const mintPersonNFT = useCallback(async (
    proof: {
      a: [bigint, bigint]
      b: [[bigint, bigint], [bigint, bigint]]
      c: [bigint, bigint]
      publicSignals: [bigint, bigint, bigint, bigint]
    },
    personHash: string,
    versionIndex: number,
    tokenURI: string,
    coreInfo: {
      basicInfo: {
        fullNameCommitment: string
        isBirthBC: boolean
        birthYear: number
        birthMonth: number
        birthDay: number
        gender: number
      }
      supplementInfo: {
        fullName: string
        birthPlace: string
        isDeathBC: boolean
        deathYear: number
        deathMonth: number
        deathDay: number
        deathPlace: string
        story: string
      }
    },
    options?: {
      onSuccess?: (result: any) => void
      onError?: (error: any) => void
    }
  ) => {
    return executeTransaction(
      () => contract!.mintPersonNFT(proof.a, proof.b, proof.c, proof.publicSignals, personHash, versionIndex, tokenURI, coreInfo),
      {
        successMessage: t('contract.mintSuccess', 'NFT minted successfully'),
        errorMessage: t('contract.mintFailed', 'Failed to mint NFT'),
        onSuccess: options?.onSuccess,
        onError: options?.onError
      }
    )
  }, [executeTransaction, t, contract])

  const endorseVersion = useCallback(async (
    personHash: string,
    versionIndex: number,
    overrides?: any
  ) => {
    return executeTransaction(
      async () => {
        console.log('🎯 About to call contract.endorseVersion with:', {
          personHash,
          versionIndex,
          overrides,
          hasContract: !!contract,
          contractAddress: contract?.target || contract?.address,
          signerAddress: (contract?.runner as any)?.address || 'unknown'
        })

        // Check if we can call view functions first
        try {
          console.log('🔍 Testing contract connectivity...')
          const testReward = await contract!.DEEP_FAMILY_TOKEN_CONTRACT()
          console.log('✅ Contract connectivity test passed:', testReward)
        } catch (connectivityError) {
          console.error('❌ Contract connectivity test failed:', connectivityError)
          throw new Error(`Contract connectivity issue: ${(connectivityError as any)?.message || connectivityError}`)
        }

        if (overrides && Object.keys(overrides).length > 0) {
          console.log('📋 Calling endorseVersion with overrides:', overrides)

          // Try to estimate gas first to catch issues early
          try {
            console.log('⛽ Estimating gas for endorseVersion...')
            const gasEst = await contract!.endorseVersion.estimateGas(personHash, versionIndex, overrides)
            console.log('⛽ Gas estimation successful:', gasEst.toString())
          } catch (gasError) {
            console.error('❌ Gas estimation failed:', gasError)
            // Don't throw here, just log - sometimes gas estimation fails but actual call works
          }

          console.log('🚀 Making actual endorseVersion call...')
          const result = await contract!.endorseVersion(personHash, versionIndex, overrides)
          console.log('✅ endorseVersion with overrides completed')
          return result
        } else {
          console.log('📋 Calling endorseVersion without overrides...')
          const result = await contract!.endorseVersion(personHash, versionIndex)
          console.log('✅ endorseVersion without overrides completed')
          return result
        }
      },
      {
        successMessage: t('contract.endorseSuccess', 'Endorsement submitted successfully'),
        errorMessage: t('contract.endorseFailed', 'Failed to endorse version')
      }
    )
  }, [executeTransaction, t, contract])

  // Read methods (no transaction required) - based on SearchPage usage
  const listPersonVersions = useCallback(async (personHash: string, offset: number, pageSize: number) => {
    if (!contract) return null
    
    try {
      const result = await contract.listPersonVersions(personHash, offset, pageSize)
      return result
    } catch (error) {
      console.error('Failed to list person versions:', error)
      toast.show(t('contract.queryFailed', 'Failed to query data'))
      return null
    }
  }, [contract, toast, t])

  const listVersionsEndorsementStats = useCallback(async (personHash: string, offset: number, pageSize: number) => {
    if (!contract) return null
    
    try {
      const result = await contract.listVersionsEndorsementStats(personHash, offset, pageSize)
      return result
    } catch (error) {
      console.error('Failed to get endorsement stats:', error)
      toast.show(t('contract.queryFailed', 'Failed to query data'))
      return null
    }
  }, [contract, toast, t])

  const getVersionDetails = useCallback(async (personHash: string, versionIndex: number) => {
    if (!contract) return null
    
    try {
      const result = await contract.getVersionDetails(personHash, versionIndex)
      return result
    } catch (error) {
      console.error('Failed to get version details:', error)
      toast.show(t('contract.queryFailed', 'Failed to query data'))
      return null
    }
  }, [contract, toast, t])

  const getNFTDetails = useCallback(async (tokenId: number) => {
    if (!contract) return null
    
    try {
      const result = await contract.getNFTDetails(tokenId)
      return result
    } catch (error) {
      console.error('Failed to get NFT details:', error)
      toast.show(t('contract.queryFailed', 'Failed to query data'))
      return null
    }
  }, [contract, toast, t])

  // Utility functions
  const getPersonHash = useCallback(async (basicInfo: {
    fullNameCommitment: string
    isBirthBC: boolean
    birthYear: number
    birthMonth: number
    birthDay: number
    gender: number
  }) => {
    if (!contract) return null
    
    try {
      const result = await contract.getPersonHash(basicInfo)
      return result
    } catch (error) {
      console.error('Failed to get person hash:', error)
      return null
    }
  }, [contract])

  const getFullNameHash = useCallback(async (fullName: string) => {
    if (!contract) return null
    
    try {
      const result = await contract.getFullNameHash(fullName)
      return result
    } catch (error) {
      console.error('Failed to get full name hash:', error)
      return null
    }
  }, [contract])

  return {
    contract,
    isContractReady: !!contract && !!signer,
    executeTransaction,
    
    // Write methods
    addPersonZK,
    mintPersonNFT,
    endorseVersion,
    
    // Read methods
    listPersonVersions,
    listVersionsEndorsementStats,
    getVersionDetails,
    getNFTDetails,
    getPersonHash,
    getFullNameHash
  }
}
