import {
  AnchorProvider,
  DISCRIMINATOR_SIZE,
  Program,
  Wallet,
  utils,
} from "@coral-xyz/anchor";
import { IDL, type Perpetuals } from "./idl";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const JUPITER_PERPETUALS_PROGRAM = new PublicKey(
  "PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu",
);

async function getCustodyAssets() {
  try {
    const connection = new Connection("https://api.mainnet-beta.solana.com");

    const program = new Program<Perpetuals>(
      IDL,
      JUPITER_PERPETUALS_PROGRAM,
      new AnchorProvider(
        connection,
        new Wallet(Keypair.generate()),
        AnchorProvider.defaultOptions(),
      ),
    );

    const solCustody = await program.account.custody.fetch(
      new PublicKey("7xS2gz2bTp3fwCC7knJvUWTEU9Tycczu6VhJYKgi1wdz"),
    );

    const custodyAssetsData = Object.fromEntries(
      Object.entries(solCustody.assets).map(([key, value]) => [
        key,
        // @ts-ignore
        value.toString(),
      ]),
    );

    console.log("Custody data: ", custodyAssetsData);
  } catch (error) {
    console.error("Failed to parse Jupiter Perps IDL", error);
  }
}

const JUPITER_PERPETUALS_EVENT_AUTHORITY = new PublicKey(
  "37hJBDnntwqhGbK7L6M1bLyvccj4u55CCUiLPdYkiqBN",
);

async function getEvents() {
  const connection = new Connection("https://api.mainnet-beta.solana.com");

  const program = new Program<Perpetuals>(
    IDL,
    JUPITER_PERPETUALS_PROGRAM,
    new AnchorProvider(
      connection,
      new Wallet(Keypair.generate()),
      AnchorProvider.defaultOptions(),
    ),
  );

  const confirmedSignatureInfos = await connection.getSignaturesForAddress(
    JUPITER_PERPETUALS_EVENT_AUTHORITY,
  );

  const successSignatures = confirmedSignatureInfos
    .filter(({ err }) => err === null)
    .map(({ signature }) => signature);

  const txs = await connection.getTransactions(successSignatures, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });

  const allEvents = txs.flatMap((tx) => {
    return tx?.meta?.innerInstructions?.flatMap((ix) => {
      return ix.instructions.map((iix, ixIndex) => {
        const ixData = utils.bytes.bs58.decode(iix.data);
        const eventData = utils.bytes.base64.encode(
          ixData.subarray(DISCRIMINATOR_SIZE),
        );
        const event = program.coder.events.decode(eventData);

        return {
          event,
          ixIndex,
          tx,
        };
      });
    });
  });

  // Sample of getting an event emitted from the Jupiter perps platform
  const closePositionRequestEvents = allEvents.filter(
    (data) => data?.event?.name === "ClosePositionRequestEvent",
  );
}

getCustodyAssets();
getEvents();
