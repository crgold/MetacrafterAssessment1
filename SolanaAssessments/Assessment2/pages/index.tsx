import {
  Keypair,
  PublicKey,
  Transaction,
  Connection,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { connect } from "http2";
import { useEffect, useState } from "react";

// create types
type DisplayEncoding = "utf8" | "hex";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

// create a provider interface (hint: think of this as an object) to store the Phantom Provider
interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

/**
 * @description gets Phantom provider, if it exists
 */
const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    // @ts-ignore
    const provider = window.solana as any;
    if (provider.isPhantom) return provider as PhantomProvider;
  }
};

function App() {
  // create state variable to hold a connection to the devnet and create the connection
  const [connection, setConnection] = useState(
    new Connection(clusterApiUrl("devnet"), "confirmed")
  );

  // create state variable for the provider
  const [provider, setProvider] = useState<PhantomProvider | undefined>(
    undefined
  );

  // create state variable to hold wallet created programmatically
  const [sender, setSender] = useState<Keypair | undefined>(
    undefined
  );

  // state to hold whether the first wallet key was successfully created
  const [isAccountCreated, setIsAccountCreated] = useState(false);

  // create state variable for the wallet key
  const [walletKey, setWalletKey] = useState<PhantomProvider | undefined>(
    undefined
  );

  // State for showing and hiding Ui elements throughout the different stages
  const [showNewAccountBtn, setShowNewAccountBtn] = useState(true);
  const [showConnectWalletTxt, setShowConnectWalletTxt] = useState(true);

  // this is the function that runs whenever the component updates (e.g. render, refresh)
  useEffect(() => {
    const provider = getProvider();

    // if the phantom provider exists, set this as the provider
    if (provider) setProvider(provider);
    else setProvider(undefined);
  }, []);

  /**
   * @description prompts user to connect wallet if it exists.
   * This function is called when the connect wallet button is clicked
   */
  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    // checks if phantom wallet exists
    if (solana) {
      try {
        // connects wallet and returns response which includes the wallet public key
        const response = await solana.connect();
        console.log("wallet account ", response.publicKey.toString());
        // update walletKey to be the public key
        setWalletKey(response.publicKey.toString());
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  // HTML code for the app
  return (
    <div className="App">
      <header className="App-header">
        {showNewAccountBtn && (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
              backgroundColor: "white",
              color: "#282c34",
              marginTop: "15px",
            }}
            onClick={async () => {
              try {
                // create new wallet and airdrop 2 sol to it
                const newWallet = new Keypair();
                console.log(`New account created: ${newWallet.publicKey}`);
                const signature = await connection.requestAirdrop(
                  new PublicKey(newWallet.publicKey),
                  2 * LAMPORTS_PER_SOL
                );
                await connection.confirmTransaction(signature);
                console.log(
                  `Airdrop completed. Balance on new account is: ${await connection.getBalance(
                    newWallet.publicKey
                  ) / LAMPORTS_PER_SOL}`
                );
                // set account creation flag to true and set sender to the new wallet
                setIsAccountCreated(true);
                setSender(newWallet);
                // hide button
                setShowNewAccountBtn(false);
              } catch (err) {
                console.log(err);
              }
            }}
          >
            Create a new Solana account
          </button>
        )}
        {isAccountCreated && showConnectWalletTxt && (
          <h2>Connect to Phantom Wallet</h2>
        )}
        {isAccountCreated && provider && !walletKey && (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
              backgroundColor: "white",
              color: "#282c34",
              marginTop: "15px",
            }}
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
        {isAccountCreated && provider && walletKey && (
          <div>
            <p>
              Connected to account: <br></br> {provider.publicKey.toString()}
            </p>
            <button
              style={{
                fontSize: "16px",
                padding: "15px",
                fontWeight: "bold",
                borderRadius: "5px",
                backgroundColor: "white",
                color: "#282c34",
                marginTop: "15px",
              }}
              onClick={async () => {
                try {
                  if (sender) {
                    console.log(
                      `Balance before transfer: ${await connection.getBalance(
                        sender.publicKey
                      ) / LAMPORTS_PER_SOL}`
                    );
                    const transaction = new Transaction().add(
                      SystemProgram.transfer({
                        fromPubkey: sender.publicKey,
                        toPubkey: new PublicKey(walletKey),
                        lamports: 1 * LAMPORTS_PER_SOL,
                      })
                    );
                    const signature = await sendAndConfirmTransaction(
                      connection,
                      transaction,
                      [sender]
                    );
                    console.log(`Signature of transfer is ${signature}`);console.log(
                      `Sender balance after transfer: ${await connection.getBalance(
                        sender.publicKey
                      ) / LAMPORTS_PER_SOL}` 
                    );
                } catch (err) {
                  console.log(err);
                }
              }}
            >
              Transfer to new wallet
            </button>
            <button
              style={{
                fontSize: "16px",
                padding: "15px",
                fontWeight: "bold",
                borderRadius: "5px",
                backgroundColor: "white",
                color: "#282c34",
                marginTop: "15px",
                marginRight: "15px",
                position: "absolute",
                top: "0px",
                right: "0px",
              }}
              onClick={() => {
                setWalletKey(undefined);
                provider.disconnect();
              }}
            >
              Disconnect Wallet
            </button>
          </div>
        )}

        {!provider && (
          <p>
            No provider found. Install{" "}
            <a href="https://phantom.app/">Phantom Browser extension</a>
          </p>
        )}
      </header>
    </div>
  );
}

export default App;
