module.exports = {
  config: {
    name: "gcinfo",
    aliases: [],
    version: "1.1",
    author: "〲T A N J I L ツ",
    role: 0,
    shortDescription: {
      en: "Show group info"
    },
    longDescription: {
      en: "Displays group name, photo, member stats, and admins beautifully"
    },
    category: "Group",
    guide: {
      en: "/gcinfo"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const groupName = threadInfo.threadName || "Unnamed Group";
      const adminIDs = threadInfo.adminIDs.map(i => i.id);
      const admins = threadInfo.userInfo.filter(user => adminIDs.includes(user.id));
      const males = threadInfo.userInfo.filter(u => u.gender === 'MALE').length;
      const females = threadInfo.userInfo.filter(u => u.gender === 'FEMALE').length;
      const groupImage = threadInfo.imageSrc;

      let adminList = admins.map(ad => `• ${ad.name}`).join("\n");

      const border = "━━━━━━━━━━━━━━━━━━━━━━";
      const msg =
        `╭${border}╮\n` +
        `┃ 👥 𝗡𝗮𝗺𝗲: ${groupName}\n` +
        `┃ 👦 𝗠𝗮𝗹𝗲𝘀: ${males}\n` +
        `┃ 👧 𝗙𝗲𝗺𝗮𝗹𝗲𝘀: ${females}\n` +
        `┃ 👑 𝗔𝗱𝗺𝗶𝗻𝘀:\n` +
        `┃ ${adminList.split("\n").join("\n┃ ")}\n` +
        `╰${border}╯`;

      if (groupImage) {
        const axios = require('axios');
        const fs = require('fs-extra');
        const path = __dirname + "/tmp.png";

        const res = await axios.get(groupImage, { responseType: "arraybuffer" });
        fs.writeFileSync(path, Buffer.from(res.data, "utf-8"));

        api.sendMessage({
          body: msg,
          attachment: fs.createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path));
      } else {
        api.sendMessage(msg, event.threadID);
      }
    } catch (err) {
      api.sendMessage("❌ Failed to get group info.", event.threadID);
    }
  }
};
