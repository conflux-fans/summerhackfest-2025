import { expect } from "chai";
import { getSigners, deployArtifact } from "../utils/helpers";

describe("BitPackedCharacterLib", () => {
  it("generateNewCharacter produces valid packed words", async () => {
    const signers = await getSigners();
    const owner = signers[0];
    const helper = await deployArtifact(owner, "HelpersForTests", []);
    const [core, prog] = await helper.read.generateNewCharacter([123n, 10n, 20n, 5n, 3n]);
    expect(core).to.be.a("bigint");
    expect(prog).to.be.a("bigint");
    // level should be 1 encoded in low bits
    const level = (core >> 0n) & 0xffn;
    expect(level).to.equal(1n);
  });
});
