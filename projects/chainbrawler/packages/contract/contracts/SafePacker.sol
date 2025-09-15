// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

/**
 * @title SafePacker
 * @author ChainBrawler Team
 * @notice Small helper to safely write into bitpacked slots with clamping.
 * @dev Used across the migration contract to avoid overflow when writing packed fields.
 */
library SafePacker {
    /// @notice Clamp a value to the provided bitmask (max value == mask)
    /// @param value The value to clamp
    /// @param mask The bitmask to clamp to
    /// @return The clamped value
    function clampToMask(uint256 value, uint256 mask) internal pure returns (uint256) {
        if (value > mask) {
            return mask;
        }
        return value;
    }

    /// @notice Update a packed uint256 field: clear the field at shift/mask and write clamped value
    /// @param packed The packed value
    /// @param shift The shift amount
    /// @param mask The bitmask
    /// @param value The value to write
    /// @return The updated packed value
    function writeClamped(uint256 packed, uint256 shift, uint256 mask, uint256 value) internal pure returns (uint256) {
        uint256 v = clampToMask(value, mask);
        return (packed & ~(mask << shift)) | (v << shift);
    }
}
