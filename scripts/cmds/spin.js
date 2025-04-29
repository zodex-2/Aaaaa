const fs = require("fs");

module.exports = {
  config: {
    name: "spin",
    version: "1.0",
    author: "〲T A N J I L ツ",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Spin to win or lose coins!",
    },
    longDescription: {
      en: "Try your luck in a slot-style spin game. You have a 40% chance to win double your bet!",
    },
    category: "games",
    guide: {
      en: "{pn} [amount]",
    }
  },

  onStart: async function ({ args, message, event }) {
    const userID = event.senderID;
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply("Please enter a valid amount to spin.");
    }

    const balancePath = __dirname + "/balance.json";

    let balances = {};
    if (fs.existsSync(balancePath)) {
      balances = JSON.parse(fs.readFileSync(balancePath, "utf8"));
    }

    if (!balances[userID]) balances[userID] = 1000;

    if (balances[userID] < amount) {
      return message.reply("You don't have enough balance to spin.");
    }

    const slotLine = "§••••••••↑↓••••••••§";
    let resultText = "";

    const isWin = Math.random() < 0.4;

    if (isWin) {
      balances[userID] += amount;
      resultText = `You WON!\n+${amount} coins added.\nYour Balance: ${balances[userID]} coins.`;
    } else {
      balances[userID] -= amount;
      resultText = `You LOST!\n-${amount} coins deducted.\nYour Balance: ${balances[userID]} coins.`;
    }

    fs.writeFileSync(balancePath, JSON.stringify(balances, null, 2));

    const finalMessage = `${slotLine}\n\n${resultText}\n\n${slotLine}`;
    message.reply(finalMessage);
  }
};
