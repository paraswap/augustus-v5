import { TransactionResponse } from "@ethersproject/abstract-provider";
import { Contract } from "@ethersproject/contracts";

const txWrapper = (tx: TransactionResponse) => ({
  async wait() {
    console.log(`Waiting for confirmation on tx hash ${tx.hash} ...`);
    const txReceipt = await tx.wait();
    console.log("Tx confirmation received!");
    return txReceipt;
  },
});

export const augustusWrapper = (augustusContract: Contract) => ({
  async grantRole(role: string, account: string) {
    console.log(`PERFORMING ADMIN: augustus.grantRole('${role}', '${account}')`);
    const tx = await augustusContract.grantRole(role, account);
    console.log(`Sent transaction with hash ${tx.hash}`);
    return txWrapper(tx);
  },
  async setImplementation(sig: string, contract: string) {
    console.log(`PERFORMING ADMIN: augustus.setImplementation('${sig}', '${contract}')`);
    const tx = await augustusContract.setImplementation(sig, contract);
    console.log(`Sent transaction with hash ${tx.hash}`);
    return txWrapper(tx);
  },
});
