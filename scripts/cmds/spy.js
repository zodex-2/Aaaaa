module.exports = {
  config: {
    name: "spy",
    version: "3.0",
    author: "T A N J I L",
    countDown: 60,
    role: 0,
    shortDescription: "See detailed user info",
    longDescription: "Fetch full profile info including name, UID, gender, balance, and more.",
    category: "image",
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];
    let uid;

    if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        uid = args[0];
      } else {
        const match = args[0].match(/profile\.php\?id=(\d+)/);
        if (match) uid = match[1];
      }
    }

    if (!uid) {
      uid = event.type === "message_reply"
        ? event.messageReply.senderID
        : uid2 || uid1;
    }

    try {
      const userInfo = await new Promise((resolve, reject) => {
        api.getUserInfo(uid, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      const avatarUrl = await usersData.getAvatarUrl(uid);
      const data = await usersData.get(uid);

      const name = userInfo[uid].name || "Unknown";
      const gender = userInfo[uid].gender === 1 ? "Female" : userInfo[uid].gender === 2 ? "Male" : "Unknown";
      const isFriend = userInfo[uid].isFriend ? "Yes" : "No";
      const isBirthday = userInfo[uid].isBirthday ? "Yes" : "No";
      const profileUrl = `https://www.facebook.com/${uid}`;
      const balance = data.money || 0;

      const fancyInfo = 
`╭───────────────┈⊷
│ 𝗨𝗦𝗘𝗥 𝗜𝗡𝗙𝗢 𝗧𝗥𝗔𝗖𝗞𝗘𝗥
├───────────────┈⊷
│ 🧑‍💼 𝗡𝗮𝗺𝗲: ${name}
│ 🆔 𝗨𝗜𝗗: ${uid}
│ ⚖️ 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: $${balance}
│ ⚧️ 𝗚𝗲𝗻𝗱𝗲𝗿: ${gender}
│ 🎉 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆 𝗧𝗼𝗱𝗮𝘆: ${isBirthday}
│ 🤝 𝗙𝗿𝗶𝗲𝗻𝗱: ${isFriend}
│ 🌐 𝗣𝗿𝗼𝗳𝗶𝗹𝗲: 
│ ${profileUrl}
╰───────────────┈⊷`;

      return message.reply({
        body: fancyInfo,
        attachment: await global.utils.getStreamFromURL(avatarUrl)
      });

    } catch (e) {
      console.error(e);
      return message.reply("⚠️ Could not fetch user data.");
    }
  }
};
