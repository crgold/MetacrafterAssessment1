// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram
} = require("@solana/web3.js");
const { get } = require("http");

// create connection
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Create a new keypair
const sender = new Keypair();
const receiver = new Keypair();

// Exact the public and private key from the keypair for sender
const senderPublicKey = new PublicKey(sender._keypair.publicKey).toString();
const senderPrivateKey = sender._keypair.secretKey;

// Exact the public and private key from the keypair for receiver
const receiverPublicKey = new PublicKey(receiver._keypair.publicKey).toString();
const receiverPrivateKey = receiver._keypair.secretKey;

console.log("Public Key of generated sender keypair", senderPublicKey);
console.log("Public Key of generated receiver keypair", receiverPublicKey);

// Make wallets (keypairs) from private keys
const senderWallet = await Keypair.fromSecretKey(senderPrivateKey);
const receiverWallet = await Keypair.fromSecretKey(receiverPrivateKey);


// Get the wallet balance from a given private key
const getWalletBalance = async (userPublicKey) => {
    try { 
        return await connection.getBalance(userPublicKey);
    } catch (err) {
        console.log(err);
    }
};

const airDropSol = async () => {
    try {
        // Request airdrop of 2 SOL to the sender wallet
        console.log("Airdropping some SOL to sender wallet!");
        const fromAirDropSignature = await connection.requestAirdrop(
            sender.publicKey,
            2 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(fromAirDropSignature);
    } catch (err) {
        console.log(err);
    }
};

const transferSol = async (sender, receiver, amount) => {
    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: sender,
                toPubkey: receiver,
                lamports: amount * LAMPORTS_PER_SOL
            })
        )
    } catch (err) {
        console.log(err);
    }
};

// Show the wallet balance before and after airdropping SOL
const mainFunction = async () => {
    // Airdrop sol to sender wallet
    await airDropSol();

    // Display balances of wallets
    console.log(`Sender wallet balance: ${await getWalletBalance(senderPublicKey)}`);
    console.log(`Receiver wallet balance: ${await getWalletBalance(receiverPublicKey)}`)

    // Transfer 50% of sender balance to receiver
    transferSol(senderPublicKey, receiverPublicKey, await getWalletBalance(senderPublicKey) * 0.5);

    // Display new balances
    console.log(`Sender wallet balance: ${await getWalletBalance(senderPublicKey)}`);
    console.log(`Receiver wallet balance: ${await getWalletBalance(receiverPublicKey)}`)
}

mainFunction();