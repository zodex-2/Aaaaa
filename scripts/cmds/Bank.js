const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "bank",
    version: "1.2",
    description: "Deposit, withdraw, earn interest, loan system",
    guide: {
      vi: "",
      en: "{pn}Bank:\nInterest - Balance\n - Withdraw \n- Deposit \n- Transfer \n- Richest \n- Loan \n- Payloan"
    },
    category: "💰 Economy",
    countDown: 1,
    role: 0,
    author: "〲T A N J I L ツ"
  },

  onStart: async function ({ args, message, event, api, usersData }) {
    const userMoney = await usersData.get(event.senderID, "money");
    const user = parseInt(event.senderID);
    const info = await api.getUserInfo(user);
    const username = info[user].name;

    const bankDataPath = 'scripts/cmds/bankData.json';

    if (!fs.existsSync(bankDataPath)) {
      fs.writeFileSync(bankDataPath, JSON.stringify({}), "utf8");
    }

    const bankData = JSON.parse(fs.readFileSync(bankDataPath, "utf8"));

    if (!bankData[user]) {
      bankData[user] = { bank: 0, lastInterestClaimed: Date.now(), loan: 0, loanTime: null };
      fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
    }

    let bankBalance = bankData[user].bank || 0;
    const command = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    const recipientUID = parseInt(args[2]);

    switch (command) {
      
      case undefined:
        return message.reply(
`∬≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡∬
                ⳹ 𝐁𝐀𝐍𝐊 𝐒𝐘𝐒𝐓𝐄𝐌 ⳼
∬≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡∬

🏦 ➤ 𝗕𝗮𝗹𝗮𝗻𝗰𝗲   : Check your bank balance
💰 ➤ 𝗗𝗲𝗽𝗼𝘀𝗶𝘁   : Deposit money into the bank
🏧 ➤ 𝗪𝗶𝘁𝗵𝗱𝗿𝗮𝘄   : Withdraw money from the bank
📈 ➤ 𝗜𝗻𝘁𝗲𝗿𝗲𝘀𝘁   : Earn interest on your savings
💳 ➤ 𝗧𝗿𝗮𝗻𝘀𝗳𝗲𝗿   : Send money to others
👑 ➤ 𝗥𝗶𝗰𝗵𝗲𝘀𝗧   : View the richest users
🪙 ➤ 𝗟𝗼𝗮𝗻       : Borrow money (Loan system)
💵 ➤ 𝗣𝗮𝘆 𝗟𝗼𝗮𝗻 : Repay your loan

∬≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡∬`
        );

      case "deposit":
        if (isNaN(amount) || amount <= 0) {
          return message.reply("❏Please enter a valid amount to deposit.");
        }
        if (userMoney < amount) {
          return message.reply("❏You don't have enough money to deposit.");
        }
        bankData[user].bank += amount;
        await usersData.set(event.senderID, { money: userMoney - amount });
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
        return message.reply(`❏Deposited $${amount} successfully!`);
      
      case "withdraw":
        if (isNaN(amount) || amount <= 0) {
          return message.reply("❏Please enter a valid amount to withdraw.");
        }
        if (amount > bankBalance) {
          return message.reply("❏Insufficient bank balance.");
        }
        bankData[user].bank -= amount;
        await usersData.set(event.senderID, { money: userMoney + amount });
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
        return message.reply(`❏Withdrew $${amount} successfully!`);

      case "balance":
        return message.reply(`❏Your bank balance is: $${formatNumberWithFullForm(bankBalance)}`);

      case "interest":
        const interestRate = 0.5; // 50% per 5 minutes
        const lastInterestClaimed = bankData[user].lastInterestClaimed || 0;
        const currentTime = Date.now();
        const timeDiffInSeconds = (currentTime - lastInterestClaimed) / 1000;

        if (timeDiffInSeconds < 300) {
          const remaining = 300 - timeDiffInSeconds;
          const min = Math.floor(remaining / 60);
          const sec = Math.floor(remaining % 60);
          return message.reply(`❏Please wait ${min} min ${sec} sec for next interest claim.`);
        }

        if (bankData[user].bank <= 0) {
          return message.reply("❏You have no money in your bank account to earn interest.");
        }

        const interestEarned = bankData[user].bank * interestRate;
        bankData[user].bank += interestEarned;
        bankData[user].lastInterestClaimed = currentTime;
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

        return message.reply(`❏You earned interest: $${formatNumberWithFullForm(interestEarned)}!`);

      case "loan":
        if (bankData[user].loan > 0) {
          return message.reply("❏You already have an active loan.");
        }
        if (amount !== 10000) {
          return message.reply("❏You can only take a loan of $10,000.");
        }

        bankData[user].loan = 10000;
        bankData[user].loanTime = Date.now();
        await usersData.set(event.senderID, { money: userMoney + 10000 });
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
        return message.reply("❏You have successfully taken a loan of $10,000!");

      case "payloan":
        if (bankData[user].loan <= 0) {
          return message.reply("❏You don't have any loan to pay.");
        }
        if (userMoney < bankData[user].loan) {
          return message.reply("❏You don't have enough money to repay the loan.");
        }

        await usersData.set(event.senderID, { money: userMoney - bankData[user].loan });
        bankData[user].loan = 0;
        bankData[user].loanTime = null;
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
        return message.reply("❏Loan repaid successfully!");

      default:
        return message.reply("❏Unknown command.");
    }

    // Check overdue loan and deduct automatically
    if (bankData[user].loan > 0 && bankData[user].loanTime) {
      const overdueTime = 3 * 24 * 60 * 60 * 1000; // 3 days
      if (Date.now() - bankData[user].loanTime > overdueTime) {
        const totalDeduct = bankData[user].loan;
        if (bankBalance >= totalDeduct) {
          bankData[user].bank -= totalDeduct;
          bankData[user].loan = 0;
          bankData[user].loanTime = null;
          fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
        }
      }
    }
  }
};

// Helper function
function formatNumberWithFullForm(number) {
  if (number >= 1e9) return (number / 1e9).toFixed(2) + "B";
  if (number >= 1e6) return (number / 1e6).toFixed(2) + "M";
  if (number >= 1e3) return (number / 1e3).toFixed(2) + "K";
  return number.toFixed(2);
  }
