const txFake = {
  wait() {},
};

export const augustusFake = {
  grantRole(role: string, account: string) {
    console.log(`ADMIN REQUIRED: augustus.grantRole('${role}', '${account}')`);
    return txFake;
  },
  setImplementation(sig: string, contract: string) {
    console.log(`ADMIN REQUIRED: augustus.setImplementation('${sig}', '${contract}')`);
    return txFake;
  },
};
