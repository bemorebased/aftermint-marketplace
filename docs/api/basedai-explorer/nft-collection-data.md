# BasedAI Explorer API: NFT & Collection Data Endpoints

This document outlines key API endpoints from the BasedAI Explorer (`https://explorer.bf1337.org/api`) relevant for fetching NFT instance details and collection-level information for the AfterMint Marketplace.

## NFT Instance Data

### 1. Get NFT Instance by ID

*   **Endpoint**: `GET /tokens/{address_hash}/instances/{id}`
*   **Description**: Retrieves detailed information about a specific NFT instance.
*   **Use Case**: Fetching full details for the NFT Detail Page (metadata, owner, attributes, etc.). The `{address_hash}` is the NFT contract address.
*   **Parameters**:
    *   `address_hash` (path): The NFT contract address (collection address).
    *   `id` (path): The `tokenId` of the NFT.
*   **Example Response (Conceptual)**:
    ```json
    {
      "token_address": "0xContractAddress1",
      "token_id": "101",
      "owner_address": "0xOwnerAddress",
      "name": "NFT Name A",
      "description": "A very cool NFT.",
      "image_url": "https://example.com/image/101.png",
      "metadata_url": "https://example.com/metadata/101.json",
      "attributes": [
        { "trait_type": "Color", "value": "Red" },
        { "trait_type": "Rarity", "value": "Epic" }
      ],
      // ... other instance details
    }
    ```

### 2. Get Transfers of NFT Instance

*   **Endpoint**: `GET /tokens/{address_hash}/instances/{id}/transfers`
*   **Description**: Retrieves the transfer history for a specific NFT instance.
*   **Use Case**: Building the sales/transfer history section on the NFT Detail Page.
*   **Parameters**:
    *   `address_hash` (path): The NFT contract address.
    *   `id` (path): The `tokenId` of the NFT.

### 3. Re-fetch Token Instance Metadata

*   **Endpoint**: `PATCH /tokens/{address_hash}/instances/{id}/refetch-metadata`
*   **Description**: Triggers a re-fetch of the metadata for a specific NFT instance by the explorer.
*   **Use Case**: Useful if the displayed metadata in the UI is suspected to be stale and needs an update from the source `tokenURI`.
*   **Parameters**:
    *   `address_hash` (path): The NFT contract address.
    *   `id` (path): The `tokenId` of the NFT.

## Collection Data

### 4. Get Token (Collection) Info

*   **Endpoint**: `GET /tokens/{address_hash}`
*   **Description**: Retrieves information about a token contract (which represents an NFT collection for ERC721/ERC1155).
*   **Use Case**: Displaying collection-level details on collection pages (name, symbol, total supply, description if available).
*   **Parameters**:
    *   `address_hash` (path): The NFT contract address (collection address).

### 5. Get NFT Instances for a Collection

*   **Endpoint**: `GET /tokens/{address_hash}/instances`
*   **Description**: Retrieves all NFT instances belonging to a specific token contract (collection).
*   **Use Case**: Listing all NFTs on a collection-specific page (e.g., `/collection/0xContractAddress`). Essential for browsing collections.
*   **Parameters**:
    *   `address_hash` (path): The NFT contract address.
    *   Query parameters for pagination likely exist.

### 6. Get Token (Collection) Holders

*   **Endpoint**: `GET /tokens/{address_hash}/holders`
*   **Description**: Retrieves a list of addresses that hold tokens from the specified contract, along with their balances.
*   **Use Case**: Calculating collection statistics like unique holder count.
*   **Parameters**:
    *   `address_hash` (path): The NFT contract address.

## Smart Contract / Collection Discovery

### 7. Get Verified Smart Contracts

*   **Endpoint**: `GET /smart-contracts`
*   **Description**: Retrieves a list of smart contracts that have been verified on the explorer.
*   **Use Case**: Potentially for discovering new NFT collections to list on the marketplace, if they are verified.
*   **Parameters**: Query parameters for filtering/pagination likely exist.

---
*Note: Specific request/response structures and pagination details should be confirmed by testing the API or referring to more detailed documentation if it becomes available.* 