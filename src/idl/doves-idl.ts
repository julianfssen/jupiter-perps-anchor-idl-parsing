export type Doves = {
  version: "0.1.0";
  name: "doves";
  instructions: [
    {
      name: "initialize";
      accounts: [
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "feed";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: "pair";
          type: {
            array: ["u8", 32];
          };
        },
        {
          name: "feedSigner";
          type: {
            array: ["u8", 33];
          };
        },
      ];
    },
    {
      name: "update";
      accounts: [
        {
          name: "feed";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: "update";
          type: {
            defined: "UpdateMessage";
          };
        },
        {
          name: "raise";
          type: "bool";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "priceFeed";
      type: {
        kind: "struct";
        fields: [
          {
            name: "pair";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "signer";
            type: {
              array: ["u8", 33];
            };
          },
          {
            name: "price";
            type: "u64";
          },
          {
            name: "expo";
            type: "i8";
          },
          {
            name: "timestamp";
            type: "i64";
          },
          {
            name: "bump";
            type: "u8";
          },
        ];
      };
    },
  ];
  types: [
    {
      name: "UpdateMessage";
      type: {
        kind: "struct";
        fields: [
          {
            name: "recoveryId";
            type: "u8";
          },
          {
            name: "signature";
            type: {
              array: ["u8", 64];
            };
          },
          {
            name: "price";
            type: "u64";
          },
          {
            name: "expo";
            type: "i8";
          },
          {
            name: "timestamp";
            type: "i64";
          },
        ];
      };
    },
  ];
  errors: [
    {
      code: 6000;
      name: "ThresholdUnderflow";
      msg: "Threshold must be >0";
    },
    {
      code: 6001;
      name: "ThresholdOverflow";
      msg: "Threshold must be <= whitelist length";
    },
    {
      code: 6002;
      name: "ThresholdNotMet";
      msg: "Number of signers must be >= threshold";
    },
    {
      code: 6003;
      name: "PairStringUnderflow";
      msg: "Pair string must not be blank";
    },
    {
      code: 6004;
      name: "PairStringOverflow";
      msg: "Pair string must be <= 32 bytes";
    },
    {
      code: 6005;
      name: "SignerIndexOverflow";
      msg: "Signer out of range";
    },
    {
      code: 6006;
      name: "InvalidSigner";
      msg: "Signature verification failed";
    },
    {
      code: 6007;
      name: "DuplicateSigner";
      msg: "All signers must be unique";
    },
    {
      code: 6008;
      name: "InvalidTimestamp";
      msg: "New timestamp must be greater than previous one";
    },
    {
      code: 6009;
      name: "Overflow";
      msg: "Integer overflow";
    },
    {
      code: 6010;
      name: "Underflow";
      msg: "Integer underflow";
    },
  ];
};

export const IDL: Doves = {
  version: "0.1.0",
  name: "doves",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "feed",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "pair",
          type: {
            array: ["u8", 32],
          },
        },
        {
          name: "feedSigner",
          type: {
            array: ["u8", 33],
          },
        },
      ],
    },
    {
      name: "update",
      accounts: [
        {
          name: "feed",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "update",
          type: {
            defined: "UpdateMessage",
          },
        },
        {
          name: "raise",
          type: "bool",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "priceFeed",
      type: {
        kind: "struct",
        fields: [
          {
            name: "pair",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "signer",
            type: {
              array: ["u8", 33],
            },
          },
          {
            name: "price",
            type: "u64",
          },
          {
            name: "expo",
            type: "i8",
          },
          {
            name: "timestamp",
            type: "i64",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "UpdateMessage",
      type: {
        kind: "struct",
        fields: [
          {
            name: "recoveryId",
            type: "u8",
          },
          {
            name: "signature",
            type: {
              array: ["u8", 64],
            },
          },
          {
            name: "price",
            type: "u64",
          },
          {
            name: "expo",
            type: "i8",
          },
          {
            name: "timestamp",
            type: "i64",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "ThresholdUnderflow",
      msg: "Threshold must be >0",
    },
    {
      code: 6001,
      name: "ThresholdOverflow",
      msg: "Threshold must be <= whitelist length",
    },
    {
      code: 6002,
      name: "ThresholdNotMet",
      msg: "Number of signers must be >= threshold",
    },
    {
      code: 6003,
      name: "PairStringUnderflow",
      msg: "Pair string must not be blank",
    },
    {
      code: 6004,
      name: "PairStringOverflow",
      msg: "Pair string must be <= 32 bytes",
    },
    {
      code: 6005,
      name: "SignerIndexOverflow",
      msg: "Signer out of range",
    },
    {
      code: 6006,
      name: "InvalidSigner",
      msg: "Signature verification failed",
    },
    {
      code: 6007,
      name: "DuplicateSigner",
      msg: "All signers must be unique",
    },
    {
      code: 6008,
      name: "InvalidTimestamp",
      msg: "New timestamp must be greater than previous one",
    },
    {
      code: 6009,
      name: "Overflow",
      msg: "Integer overflow",
    },
    {
      code: 6010,
      name: "Underflow",
      msg: "Integer underflow",
    },
  ],
};
