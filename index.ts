import {
  AnchorProvider,
  DISCRIMINATOR_SIZE,
  Program,
  Wallet,
  utils,
  type IdlAccounts,
} from "@coral-xyz/anchor";
import { IDL, type Perpetuals } from "./idl";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

const JUPITER_PERPETUALS_PROGRAM = new PublicKey(
  "PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu",
);

const JLP_POOL_ACCOUNT = new PublicKey(
  "5BUwFW4nRbftYTDMbgxykoFWqWHPzahFSNAaaaJtVKsq",
);

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

async function getCustodyAssets() {
  try {
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

async function getOpenPositions() {
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

    const gpaResult = await program.provider.connection.getProgramAccounts(
      program.programId,
      {
        commitment: "confirmed",
        filters: [
          {
            memcmp: program.coder.accounts.memcmp("position"),
          },
        ],
      },
    );

    const positions = gpaResult.map((item) => {
      return {
        publicKey: item.pubkey,
        account: program.coder.accounts.decode(
          "position",
          item.account.data,
        ) as IdlAccounts<Perpetuals>["position"],
      };
    });

    // Old positions accounts are not closed, but have `sizeUsd = 0`
    // i.e. open positions have a non-zero `sizeUsd`
    const openPositions = positions.filter((position) =>
      position.account.sizeUsd.gtn(0),
    );

    console.log("Open positions: ", openPositions);
  } catch (error) {
    console.error("Failed to fetch open positions", error);
  }
}

async function getPositionsForWallet(walletAddress: string) {
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

    const gpaResult = await program.provider.connection.getProgramAccounts(
      program.programId,
      {
        commitment: "confirmed",
        filters: [
          // Pass in a wallet address here to filter for positions for
          // a specific wallet address
          {
            memcmp: {
              bytes: new PublicKey(walletAddress).toBase58(),
              offset: 8,
            },
          },
          {
            memcmp: program.coder.accounts.memcmp("position"),
          },
        ],
      },
    );

    const positions = gpaResult.map((item) => {
      return {
        publicKey: item.pubkey,
        account: program.coder.accounts.decode(
          "position",
          item.account.data,
        ) as IdlAccounts<Perpetuals>["position"],
      };
    });

    // Old positions accounts are not closed, but have `sizeUsd = 0`
    // i.e. open positions have a non-zero `sizeUsd`
    // Remove this filter to retrieve closed positions as well
    const openPositions = positions.filter((position) =>
      position.account.sizeUsd.gtn(0),
    );

    console.log(
      `Open positions for wallet address ${walletAddress}: `,
      openPositions,
    );
  } catch (error) {
    console.error(
      `Failed to fetch open positions for wallet address ${walletAddress}`,
      error,
    );
  }
}

async function subscribeToWallet(walletAddress: string) {
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

    connection.onProgramAccountChange(
      program.programId,
      async ({
        accountId: positionPubkey,
        accountInfo: { data: positionBuffer },
      }) => {
        try {
          const position = program.coder.accounts.decode(
            "position",
            positionBuffer,
          ) as IdlAccounts<Perpetuals>["position"];

          console.log("Position updated:", positionPubkey.toString());
        } catch (err) {
          console.error(
            `Failed to decode position ${positionPubkey.toString()}`,
            err,
          );
        }
      },
      {
        commitment: "confirmed",
        filters: [
          {
            memcmp: {
              bytes: new PublicKey(walletAddress).toBase58(),
              offset: 8,
            },
          },
          { memcmp: program.coder.accounts.memcmp("position") },
        ],
      },
    );
  } catch (error) {
    console.error(
      `Failed to stream position updates for wallet address ${walletAddress}`,
      error,
    );
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

async function getPoolApy() {
  const pool = await program.account.pool.fetch(JLP_POOL_ACCOUNT);

  const poolApr = pool.poolApr.feeAprBps.toNumber() / 100;

  const compoundToAPY = (apr: number, frequency = 365) => {
    const apy = (Math.pow(apr / 100 / frequency + 1, frequency) - 1) * 100;
    return apy;
  };

  console.log("Pool APY (%):", compoundToAPY(poolApr));
}
