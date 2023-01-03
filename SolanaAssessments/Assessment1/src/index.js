// Import Solana web3 functionalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL
} = require("@solana/web3.js");

// Connect to the Devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Get the wallet balance from a given private key
const getWalletBalance = async (userPublicKey) => {
    try {
        // Connect to the Devnet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        console.log("Connection object is:", connection);

        const walletBalance = await connection.getBalance(userPublicKey);
        return (parseInt(walletBalance) / LAMPORTS_PER_SOL).toString();
    } catch (err) {
        console.log(err);
    }
};

const airDropSol = async () => {
    try {
        // Connect to the Devnet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        // Ask user for their address and request airdrop of 2 SOL to their wallet
        const userPublicKey = prompt("Please enter your address for the airdrop: ")
        console.log ('Your balance before the airdrop: %s SOL', getWalletBalance(userPublicKey))
        console.log("Airdropping some SOL to your wallet!");
        const airDropSignature = await connection.requestAirdrop(
            userPublicKey,
            2 * LAMPORTS_PER_SOL
        );
        const latestBlockHash = await connection.getLatestBlockhash();
        await connection.confirmTransaction(
            latestBlockHash.blockhash,
            latestBlockHash.lastValidBlockHeight,
            airDropSignature,
        );
        console.log ('Your balance after the airdrop: %s SOL', getWalletBalance(userPublicKey))
    } catch (err) {
        console.log(err);
    }
};

// Show the wallet balance before and after airdropping SOL
const mainFunction = async () => {
    await airDropSol();
}

mainFunction();