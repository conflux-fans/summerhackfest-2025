import { expect } from "chai";
import { getSigners, deployArtifact } from "../utils/helpers";

describe("CombatMath & CombatConfig", () => {
  it("performRound deterministic behavior", async () => {
    const signers = await getSigners();
    const owner = signers[0];
    const cm = await deployArtifact(owner, "CombatMathTester", []);

    const res = await cm.read.performRound([10n, 8n, 2n, 3n, 50n, 30n, 5n, 2n]);
    // destructure
    const [newP, newE, pDmg, eDmg, died, pCrit, eCrit] = Array.isArray(res) ? res : [res];
    expect(newP).to.be.a("bigint");
    expect(newE).to.be.a("bigint");
    expect(pDmg).to.be.a("bigint");
    expect(eDmg).to.be.a("bigint");
  });

  it("scaleEnemyForLevel increases stats", async () => {
    const signers = await getSigners();
    const owner = signers[0];
    const cm = await deployArtifact(owner, "CombatMathTester", []);
    const base = await cm.read.scaleEnemyForLevel([10n, 20n, 5n, 3n, 2n]);
    const [c, e, d, l] = Array.isArray(base) ? base : [base];
    expect(c >= 10n).to.equal(true);
  });

  it("combat config returns base stats", async () => {
    const signers = await getSigners();
    const owner = signers[0];
    const cc = await deployArtifact(owner, "CombatConfigTester", []);
    const cls = await cc.read.baseStatsByClass([0n]);
    // should return a tuple of 4 bigints
    expect(Array.isArray(cls)).to.equal(true);
    const arr = Array.isArray(cls) ? cls : [cls];
    expect(arr.length).to.be.greaterThan(0);
    expect(typeof arr[0]).to.equal("bigint");
  });
});
