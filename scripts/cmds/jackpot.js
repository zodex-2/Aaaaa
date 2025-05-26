module.exports = {
  config: {
    name: "jackpot",
    version: "2.0",
    author: "T A N J I L",
    shortDescription: { en: "Jackpot game" },
    longDescription: { en: "Try your luck in the jackpot game!" },
    category: "Game",
  },

  langs: {
    en: {
      invalid_amount: "⚠️ Invalid bet amount. Please enter a valid number like 1B, 10M, 500K, etc.",
      not_enough_money: "⚠️ You don't have enough balance to make this bet.",
      win_message:
        "╭─────\n│\n│     congratulations 🎉\n│\n│     YOU WIN 10× = $%1\n│     Balance: $%2\n│\n│         J A C K P O T\n╰─────",
      lose_message:
        "╭─────\n│\n│     Sorry...\n│\n│     You lost your bet of $%1.\n│     Balance: $%2\n│\n│         J A C K P O T\n╰─────",
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const adminIDs = global.GoatBot?.config?.adminBot || [];
    const isAdmin = adminIDs.includes(senderID);

    const input = args[0]?.toLowerCase();
    if (!input) return message.reply("⚠️ Please specify your bet amount. Example: /jackpot 1B");

    const isForceWin = input.endsWith(".win");
    const rawAmount = isForceWin ? input.replace(".win", "") : input;

    function parseAmount(amountStr) {
      const units = { k: 1e3, m: 1e6, b: 1e9, t: 1e12, q: 1e15 };
      const match = amountStr.match(/^(\d+(\.\d+)?)([kmbtq])$/);
      if (!match) return null;
      const [_, num, __, unit] = match;
      return parseFloat(num) * units[unit];
    }

    const betAmount = parseAmount(rawAmount);
    if (!betAmount || betAmount < 1000) {
      return message.reply(getLang("invalid_amount"));
    }

    const userData = await usersData.get(senderID);
    const balance = userData.money || 0;

    if (balance < betAmount) {
      return message.reply(getLang("not_enough_money"));
    }

    const isWinner = isForceWin ? isAdmin : Math.random() < 0.1;
    let winAmount = 0;
    let resultText = "";

    if (isWinner) {
      winAmount = betAmount * 10;
      const finalBalance = balance + winAmount;
      resultText = getLang("win_message", formatCurrency(winAmount), formatCurrency(finalBalance));
    } else {
      winAmount = -betAmount;
      const finalBalance = balance + winAmount;
      resultText = getLang("lose_message", formatCurrency(betAmount), formatCurrency(finalBalance));
    }

    await usersData.set(senderID, {
      money: balance + winAmount,
      data: userData.data,
    });

    return message.reply(resultText);

    // Format number to currency with unit
    function formatCurrency(number) {
      if (number >= 1e15) return (number / 1e15).toFixed(2) + "Q";
      if (number >= 1e12) return (number / 1e12).toFixed(2) + "T";
      if (number >= 1e9) return (number / 1e9).toFixed(2) + "B";
      if (number >= 1e6) return (number / 1e6).toFixed(2) + "M";
      if (number >= 1e3) return (number / 1e3).toFixed(2) + "K";
      return number.toFixed(2);
    }
  },
};
