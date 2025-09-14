const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Exchange Contract", function () {
  let Exchange, FC, exchange, fcToken, owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // 部署FC代币
    FC = await ethers.getContractFactory("FC");
    fcToken = await FC.deploy(owner.address);

    // 部署Exchange合约
    Exchange = await ethers.getContractFactory("Exchange");
    exchange = await upgrades.deployProxy(Exchange, [fcToken.address, owner.address]);

    // 给用户1一些FC代币
    await fcToken.mint(user1.address, ethers.parseEther("1000"));
  });

  describe("初始化", function () {
    it("应该正确初始化合约", async function () {
      expect(await exchange.fcToken()).to.equal(fcToken.address);
      expect(await exchange.exchangeRatio()).to.equal(5);
      expect(await exchange.owner()).to.equal(owner.address);
    });
  });

  describe("管理员功能", function () {
    it("管理员可以设置兑换比例", async function () {
      await exchange.setExchangeRatio(10);
      expect(await exchange.exchangeRatio()).to.equal(10);
    });

    it("非管理员不能设置兑换比例", async function () {
      await expect(
        exchange.connect(user1).setExchangeRatio(10)
      ).to.be.revertedWithCustomError(exchange, "OwnableUnauthorizedAccount");
    });

    it("管理员可以存入FC代币", async function () {
      const amount = ethers.parseEther("100");
      await fcToken.approve(exchange.address, amount);
      await exchange.depositFc(amount);
      expect(await exchange.fcBalance()).to.equal(amount);
    });

    it("管理员可以存入CFX", async function () {
      const amount = ethers.parseEther("10");
      await exchange.depositCfx({ value: amount });
      expect(await ethers.provider.getBalance(exchange.address)).to.equal(amount);
    });
  });

  describe("兑换功能", function () {
    beforeEach(async function () {
      // 管理员存入一些FC和CFX
      const fcAmount = ethers.parseEther("1000");
      const cfxAmount = ethers.parseEther("100");
      
      await fcToken.approve(exchange.address, fcAmount);
      await exchange.depositFc(fcAmount);
      await exchange.depositCfx({ value: cfxAmount });
    });

    it("用户可以用FC兑换CFX", async function () {
      const fcAmount = ethers.parseEther("50");
      const expectedCfxAmount = fcAmount / 5n; // 5:1比例

      await fcToken.connect(user1).approve(exchange.address, fcAmount);
      
      const initialCfxBalance = await ethers.provider.getBalance(user1.address);
      await exchange.connect(user1).exchangeFcToCfx(fcAmount);
      const finalCfxBalance = await ethers.provider.getBalance(user1.address);

      expect(finalCfxBalance - initialCfxBalance).to.equal(expectedCfxAmount);
    });

    it("用户可以用CFX兑换FC", async function () {
      const cfxAmount = ethers.parseEther("10");
      const expectedFcAmount = cfxAmount * 5n; // 5:1比例

      const initialFcBalance = await fcToken.balanceOf(user1.address);
      await exchange.connect(user1).exchangeCfxToFc({ value: cfxAmount });
      const finalFcBalance = await fcToken.balanceOf(user1.address);

      expect(finalFcBalance - initialFcBalance).to.equal(expectedFcAmount);
    });
  });

  describe("待兑换订单", function () {
    it("当余额不足时创建待兑换订单", async function () {
      const fcAmount = ethers.parseEther("1000");
      await fcToken.connect(user1).approve(exchange.address, fcAmount);
      
      await exchange.connect(user1).exchangeFcToCfx(fcAmount);
      
      const order = await exchange.getPendingOrder(1);
      expect(order.user).to.equal(user1.address);
      expect(order.amount).to.equal(fcAmount);
      expect(order.isFcToCfx).to.be.true;
      expect(order.executed).to.be.false;
    });

    it("管理员可以执行待兑换订单", async function () {
      const fcAmount = ethers.parseEther("1000");
      await fcAmountToken.connect(user1).approve(exchange.address, fcAmount);
      
      await exchange.connect(user1).exchangeFcToCfx(fcAmount);
      
      // 管理员存入CFX
      const cfxAmount = ethers.parseEther("200");
      await exchange.depositCfx({ value: cfxAmount });
      
      // 执行订单
      await exchange.executePendingOrder(1);
      
      const order = await exchange.getPendingOrder(1);
      expect(order.executed).to.be.true;
    });
  });
}); 