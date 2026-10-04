// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VirtualWorld {

    // ==========================================
    // LAND
    // ==========================================

    struct Land {
        address owner;
        uint256 landId;
        bool claimed;
    }

    mapping(uint256 => Land) public lands;


    // ==========================================
    // DIGITAL ASSET
    // ==========================================

    struct DigitalAsset {
        uint256 assetId;
        uint256 landId;
        address owner;
        string assetReference;
        bool exists;
    }

    mapping(uint256 => DigitalAsset) public digitalAssets;


    // ==========================================
    // EVENTS
    // ==========================================

    event LandClaimed(
        uint256 indexed landId,
        address indexed owner
    );

    event LandTransferred(
        uint256 indexed landId,
        address indexed from,
        address indexed to
    );

    event AssetStoredOnChain(
        uint256 indexed assetId,
        uint256 indexed landId,
        address indexed owner,
        string assetReference
    );


    // ==========================================
    // CLAIM LAND
    // ==========================================

    function claimLand(uint256 landId) public {

        require(
            !lands[landId].claimed,
            "Land already claimed"
        );

        lands[landId] = Land(
            msg.sender,
            landId,
            true
        );

        emit LandClaimed(
            landId,
            msg.sender
        );
    }


    // ==========================================
    // TRANSFER LAND
    // ==========================================

    function transferLand(
        uint256 landId,
        address newOwner
    ) public {

        require(
            lands[landId].owner == msg.sender,
            "Not land owner"
        );

        require(
            newOwner != address(0),
            "Invalid address"
        );

        address oldOwner =
            lands[landId].owner;

        lands[landId].owner =
            newOwner;

        emit LandTransferred(
            landId,
            oldOwner,
            newOwner
        );
    }


    // ==========================================
    // GET LAND OWNER
    // ==========================================

    function getLandOwner(
        uint256 landId
    ) public view returns (address) {

        return lands[landId].owner;
    }


    // ==========================================
    // STORE DIGITAL ASSET ON-CHAIN
    // ==========================================

    function storeAssetOnChain(
        uint256 assetId,
        uint256 landId,
        string memory assetReference
    ) public {

        require(
            lands[landId].owner == msg.sender,
            "Not land owner"
        );

        require(
            !digitalAssets[assetId].exists,
            "Asset already exists"
        );

        digitalAssets[assetId] = DigitalAsset(
            assetId,
            landId,
            msg.sender,
            assetReference,
            true
        );

        emit AssetStoredOnChain(
            assetId,
            landId,
            msg.sender,
            assetReference
        );
    }


    // ==========================================
    // GET DIGITAL ASSET
    // ==========================================

    function getDigitalAsset(
        uint256 assetId
    )
        public
        view
        returns (
            uint256,
            uint256,
            address,
            string memory,
            bool
        )
    {
        DigitalAsset memory asset =
            digitalAssets[assetId];

        return (
            asset.assetId,
            asset.landId,
            asset.owner,
            asset.assetReference,
            asset.exists
        );
    }
}