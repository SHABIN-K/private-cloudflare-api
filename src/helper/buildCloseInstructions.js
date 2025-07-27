import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createCloseAccountInstruction } from "@solana/spl-token";

async function buildCloseInstructions(ataList, wallet) {
  const walletPubKey = new PublicKey(wallet);
  const RELAYER_PUBLIC_KEY = new PublicKey("AK7ecjPXdnk2svnTUXWzRX1d6xfC2EhRGPP56g5GLsvn");
  const dest = new PublicKey("AK7ecjPXdnk2svnTUXWzRX1d6xfC2EhRGPP56g5GLsvn");

  const instructions = ataList.map(ata =>
    createCloseAccountInstruction(
      new PublicKey(ata), // Account to close
      dest, // Destination (refund lamports)
      RELAYER_PUBLIC_KEY, // Authority (must sign)
      [], // MultiSigners (none)
      TOKEN_PROGRAM_ID
    )
  );

  return instructions;
}

export default buildCloseInstructions;
