import { expect } from "chai";
import { getSigners, deployArtifact } from "../utils/helpers";

describe("CombatMath Validation", () => {
  let combatMathTester: any;
  let owner: any;

  beforeEach(async () => {
    const signers = await getSigners();
    owner = signers[0];

    combatMathTester = await deployArtifact(owner, "CombatMathTester", []);
  });

  it("should not heal player when enemy dies", async () => {
    console.log("🔍 Testing CombatMath.performRound enemy death scenario...");

    // Test specific scenario: strong player vs weak enemy
    const playerCombat = 10;
    const enemyCombat = 2;
    const enemyDefense = 1;
    const playerDefense = 3;
    const playerCurrentHP = 15; // Player damaged
    const enemyCurrentHP = 2; // Enemy almost dead
    const playerLuck = 2;
    const enemyLuck = 1;

    console.log(`Initial: Player HP ${playerCurrentHP}, Enemy HP ${enemyCurrentHP}`);

    const result = await combatMathTester.read.performRound([
      playerCombat,
      enemyCombat,
      enemyDefense,
      playerDefense,
      playerCurrentHP,
      enemyCurrentHP,
      playerLuck,
      enemyLuck
    ]);

    const [newPlayerHP, newEnemyHP, playerDamage, enemyDamage, playerDied, playerCritical, enemyCritical] = result;

    console.log(`Result: Player HP ${Number(newPlayerHP)}, Enemy HP ${Number(newEnemyHP)}`);
    console.log(`Damage: Player dealt ${Number(playerDamage)}, Enemy dealt ${Number(enemyDamage)}`);

    // Enemy should die (HP = 0)
    expect(Number(newEnemyHP)).to.equal(0, "Enemy should die with low HP");

    // Player should NOT be healed when enemy dies
    expect(Number(newPlayerHP)).to.be.at.most(playerCurrentHP, 
      "Player HP should not increase when enemy dies");

    // If enemy dies, player takes no damage (but doesn't get healed either)
    if (Number(newEnemyHP) === 0) {
      expect(Number(newPlayerHP)).to.equal(playerCurrentHP, 
        "Player should take no damage when enemy dies, but also no healing");
    }

    console.log(`✅ CombatMath.performRound works correctly - no healing when enemy dies`);
  });

  it("should handle balanced combat correctly", async () => {
    console.log("🔍 Testing balanced combat scenario...");

    // Balanced scenario where both survive
    const result = await combatMathTester.read.performRound([
      6, // playerCombat
      5, // enemyCombat
      3, // enemyDefense
      4, // playerDefense
      20, // playerCurrentHP
      18, // enemyCurrentHP
      2, // playerLuck
      3  // enemyLuck
    ]);

    const [newPlayerHP, newEnemyHP, playerDamage, enemyDamage] = result;

    console.log(`Balanced combat: Player ${Number(newPlayerHP)} HP, Enemy ${Number(newEnemyHP)} HP`);

    // Both should survive with reduced HP
    expect(Number(newPlayerHP)).to.be.greaterThan(0, "Player should survive balanced combat");
    expect(Number(newEnemyHP)).to.be.greaterThan(0, "Enemy should survive balanced combat");
    
    // Both should take some damage
    expect(Number(newPlayerHP)).to.be.lessThan(20, "Player should take some damage");
    expect(Number(newEnemyHP)).to.be.lessThan(18, "Enemy should take some damage");

    console.log(`✅ Balanced combat works correctly`);
  });

  it("should handle player death correctly", async () => {
    console.log("🔍 Testing player death scenario...");

    // Weak player vs strong enemy
    const result = await combatMathTester.read.performRound([
      2, // playerCombat (weak)
      8, // enemyCombat (strong)
      5, // enemyDefense
      2, // playerDefense (weak)
      3, // playerCurrentHP (low)
      15, // enemyCurrentHP
      1, // playerLuck
      3  // enemyLuck
    ]);

    const [newPlayerHP, newEnemyHP, playerDamage, enemyDamage, playerDied] = result;

    console.log(`Player death test: Player ${Number(newPlayerHP)} HP, Enemy ${Number(newEnemyHP)} HP, Died: ${playerDied}`);

    // Player should likely die or be severely damaged
    expect(Number(newPlayerHP)).to.be.at.most(3, "Player should be damaged or die");
    
    if (playerDied) {
      expect(Number(newPlayerHP)).to.equal(0, "If player died, HP should be 0");
    }

    console.log(`✅ Player death scenario works correctly`);
  });
});