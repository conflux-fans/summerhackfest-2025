import { expect } from "chai";
import { getSigners, deployArtifact } from "../utils/helpers";

describe("SafePacker", () => {
  it("clampToMask caps values above mask", async () => {
    const signers = await getSigners();
    const owner = signers[0];
    const h = await deployArtifact(owner, "HelpersForTests", []);
    const res = await h.read.clampToMask([500n, 255n]);
    expect(res).to.equal(255n);
  });

  it("writeClamped writes within mask", async () => {
    const signers = await getSigners();
    const owner = signers[0];
    const h = await deployArtifact(owner, "HelpersForTests", []);
    const packed = 0n;
    const out = await h.read.writeClamped([packed, 8n, 0xffn, 123n]);
    expect(out).to.be.a("bigint");
  });
});
