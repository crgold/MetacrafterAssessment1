import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from "@solana/spl-token";
import { Connection, Keypair, ParsedAccountData, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import secret from '../ownerSecret.json';
import mintSecret from '../mintSecret.json';

const DEVNODE_RPC = 'https://api.devnet.solana.com';
const SOLANA_CONNECTION = new Connection(DEVNODE_RPC);
const FROM_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(secret));
const DESTINATION_WALLET_ONE = '95DmXKNoaqVRyqf2hZ7xfpP4ANW3P7FCCjovbUpMnuuc';
const DESTINATION_WALLET_TWO = '5u3ng4JSoNhyfNpKcUBUqw5ywsCV5TV5dvUXh32epQ6n'; 
const DESTINATION_WALLET_THREE = '58iYyTdsFzu1dut5AR2xTnEUqnaEYSQ8KmpjMzNikXg7'; 
const MINT_ADDRESS = Keypair.fromSecretKey(new Uint8Array(mintSecret));
const TRANSFER_AMOUNT = 1;

async function getNumberDecimals(mintAddress: string):Promise<number> {
    const info = await SOLANA_CONNECTION.getParsedAccountInfo(new PublicKey(mintAddress));
    const result = (info.value?.data as ParsedAccountData).parsed.info.decimals as number;
    return result;
}

async function sendTokens() {
    console.log(`Sending ${TRANSFER_AMOUNT} ${(MINT_ADDRESS.publicKey.toString())} from ${(FROM_KEYPAIR.publicKey.toString())} to ${(DESTINATION_WALLET_ONE)}.`)
    //Step 1
    console.log(`1 - Getting Source Token Account`);
    let sourceAccount = await getOrCreateAssociatedTokenAccount(
        SOLANA_CONNECTION, 
        FROM_KEYPAIR,
        new PublicKey(MINT_ADDRESS.publicKey),
        FROM_KEYPAIR.publicKey
    );
    console.log(`    Source Account: ${sourceAccount.address.toString()}`);

        //Step 2
        console.log(`2 - Getting Destination Token Accounts`);
        let destinationAccountOne = await getOrCreateAssociatedTokenAccount(
            SOLANA_CONNECTION, 
            FROM_KEYPAIR,
            new PublicKey(MINT_ADDRESS.publicKey),
            new PublicKey(DESTINATION_WALLET_ONE)
        );
        console.log(`    Destination Account One: ${destinationAccountOne.address.toString()}`);

        let destinationAccountTwo = await getOrCreateAssociatedTokenAccount(
            SOLANA_CONNECTION, 
            FROM_KEYPAIR,
            new PublicKey(MINT_ADDRESS.publicKey),
            new PublicKey(DESTINATION_WALLET_TWO)
        );
        console.log(`    Destination Account Two: ${destinationAccountTwo.address.toString()}`);

        let destinationAccountThree = await getOrCreateAssociatedTokenAccount(
            SOLANA_CONNECTION, 
            FROM_KEYPAIR,
            new PublicKey(MINT_ADDRESS.publicKey),
            new PublicKey(DESTINATION_WALLET_THREE)
        );
        console.log(`    Destination Account Three: ${destinationAccountThree.address.toString()}`);

        //Step 3
        console.log(`3 - Fetching Number of Decimals for Mint: ${MINT_ADDRESS.publicKey.toString()}`);
        const numberDecimals = await getNumberDecimals(MINT_ADDRESS.publicKey.toString());
        console.log(`    Number of Decimals: ${numberDecimals}`);

        //Step 4
        console.log(`4 - Creating and Sending Transaction`);
        const tx = new Transaction();
        tx.add(createTransferInstruction(
            sourceAccount.address,
            destinationAccountOne.address,
            FROM_KEYPAIR.publicKey,
            TRANSFER_AMOUNT * Math.pow(10, numberDecimals)
        ),
        createTransferInstruction(
            sourceAccount.address,
            destinationAccountTwo.address,
            FROM_KEYPAIR.publicKey,
            TRANSFER_AMOUNT * Math.pow(10, numberDecimals)
        ),
        createTransferInstruction(
            sourceAccount.address,
            destinationAccountThree.address,
            FROM_KEYPAIR.publicKey,
            TRANSFER_AMOUNT * Math.pow(10, numberDecimals)
        ))
        const latestBlockHash = await SOLANA_CONNECTION.getLatestBlockhash('confirmed');
        tx.recentBlockhash = await latestBlockHash.blockhash;    
        const signature = await sendAndConfirmTransaction(SOLANA_CONNECTION,tx,[FROM_KEYPAIR]);
        console.log(
            '\x1b[32m', //Green Text
            `   Transaction Success!🎉`,
            `\n    https://explorer.solana.com/tx/${signature}?cluster=devnet`
        );
}
sendTokens();