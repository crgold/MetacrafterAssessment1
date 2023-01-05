// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction
} = require("@solana/web3.js");
const { get } = require("http");

// create connection
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Create a new keypair
const sender = new Keypair();
const receiver = new Keypair();

// Exact the public key from the keypair for sender
const senderPublicKey = new PublicKey(sender._keypair.publicKey).toString();

// Exact the public from the keypair for receiver
const receiverPublicKey = new PublicKey(receiver._keypair.publicKey).toString();

console.log("Public Key of generated sender keypair", senderPublicKey);
console.log("Public Key of generated receiver keypair", receiverPublicKey);


// Get the wallet balance from a given private key
const getWalletBalance = async (userPublicKey) => {
    try { 
        return await connection.getBalance(new PublicKey(userPublicKey));
    } catch (err) {
        console.log(err);
    }
};

const airDropSol = async () => {
    try {
        // Request airdrop of 2 SOL to the sender wallet
        console.log("Airdropping some SOL to sender wallet!");
        const fromAirDropSignature = await connection.requestAirdrop(
            new PublicKey(senderPublicKey),
            2 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(fromAirDropSignature);
    } catch (err) {
        console.log(err);
    }
};

const transferSol = async (from, to, amount) => {
    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: from,
                toPubkey: to,
                lamports: amount
            })
        );

        let signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [sender]
        );
        console.log(`Signature of transfer is ${signature}`);
    } catch (err) {
        console.log(err);
    }
};

// Show the wallet balance before and after airdropping SOL
const mainFunction = async () => {
    // Airdrop sol to sender wallet
    await airDropSol();

    // Display balances of wallets
    console.log(`Sender wallet balance: ${await getWalletBalance(senderPublicKey) / LAMPORTS_PER_SOL} SOL`);
    console.log(`Receiver wallet balance: ${await getWalletBalance(receiverPublicKey) / LAMPORTS_PER_SOL} SOL`)

    // Transfer 50% of sender balance to receiver
    console.log("Transferring 50% of sender wallet to receiver wallet");
    transferSol(senderPublicKey, receiverPublicKey, (await getWalletBalance(senderPublicKey) * 0.5));

    // Display new balances
    console.log(`Sender wallet balance: ${await getWalletBalance(senderPublicKey) / LAMPORTS_PER_SOL} SOL`);
    console.log(`Receiver wallet balance: ${await getWalletBalance(receiverPublicKey) / LAMPORTS_PER_SOL} SOL`)
}

mainFunction();