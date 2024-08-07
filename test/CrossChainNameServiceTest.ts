import { expect } from 'chai';
import { ethers } from 'ethers';
import { CCIPLocalSimulator, CrossChainNameServiceRegister, CrossChainNameServiceReceiver, CrossChainNameServiceLookup } from '../contracts';

describe('CrossChainNameService Tests', () => {
    let provider: ethers.providers.JsonRpcProvider;
    let aliceSigner: ethers.Signer;

    beforeEach(async () => {
        provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
        aliceSigner = provider.getSigner(0); // Get the first signer (adjust index if needed)
    });

    it('registers and looks up a name', async () => {
        const ccipLocalSimulator = await new CCIPLocalSimulator(aliceSigner).deploy();
        const routerAddress = await ccipLocalSimulator.configuration();

        const registerContract = await new CrossChainNameServiceRegister(aliceSigner, routerAddress).deploy();
        const receiverContract = await new CrossChainNameServiceReceiver(aliceSigner).deploy();
        const lookupContract = await new CrossChainNameServiceLookup(aliceSigner, routerAddress).deploy();

        await registerContract.enableChain(receiverContract.address); // Assuming enableChain is required

        const aliceAddress = await aliceSigner.getAddress();
        const nameToRegister = 'alice.ccns';

        await registerContract.register(nameToRegister, aliceAddress);

        const resolvedAddress = await lookupContract.lookup(nameToRegister);

        expect(resolvedAddress).to.equal(aliceAddress);
    });
});
