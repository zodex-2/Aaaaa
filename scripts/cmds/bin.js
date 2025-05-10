const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configuration
const ALLOWED_UID = "61564913640716"; // Only this UID can use the command

module.exports = {
  config: {
    name: "bin",
    aliases: ["bin"],
    version: "3.2",
    author: "Eren",
    countDown: 5,
    role: 2, // Still keep role restriction as backup
    shortDescription: {
      en: "Upload files to APIbin [Owner Only]"
    },
    longDescription: {
      en: "Upload files to apibin-x3.onrender.com (Owner restricted)"
    },
    category: "utility",
    guide: {
      en: "{pn} <filename> or reply to a file"
    }
  },

  onStart: async function({ api, event, args, message }) {
    try {
      // UID verification
      if (event.senderID !== ALLOWED_UID) {
        return message.reply("⛔ You are not authorized to use this command.");
      }

      if (event.type === "message_reply" && event.messageReply.attachments) {
        return this.uploadAttachment(api, event);
      }
      
      const fileName = args[0];
      if (!fileName) {
        return message.reply("📝 Please provide a filename or reply to a file");
      }

      await this.uploadFile(api, event, fileName);
    } catch (error) {
      console.error(error);
      message.reply("❌ Error: " + error.message);
    }
  },

  uploadFile: async function(api, event, fileName) {
    const filePath = this.findFilePath(fileName);
    if (!filePath.exists) {
      return api.sendMessage(`🔍 File "${fileName}" not found!`, event.threadID, event.messageID);
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath.fullPath));

    const { data } = await axios.post('https://apibin-x3.onrender.com/upload', form, {
      headers: form.getHeaders()
    });

    api.sendMessage({
      body: `✅ File uploaded!\n📝 Raw: ${data.raw}`,
      attachment: null
    }, event.threadID, event.messageID);
  },

  uploadAttachment: async function(api, event) {
    const attachment = event.messageReply.attachments[0];
    const response = await axios.get(attachment.url, { responseType: 'stream' });

    const form = new FormData();
    form.append('file', response.data, attachment.name || 'file.bin');

    const { data } = await axios.post('https://apibin-x3.onrender.com/upload', form, {
      headers: form.getHeaders()
    });

    api.sendMessage({
      body: `✅ Attachment uploaded!\n📝 Raw: ${data.raw}`,
      attachment: null
    }, event.threadID, event.messageID);
  },

  findFilePath: function(fileName) {
    const dir = path.join(__dirname, '..', 'cmds');
    const extensions = ['', '.js', '.ts', '.txt'];
    
    for (const ext of extensions) {
      const filePath = path.join(dir, fileName + ext);
      if (fs.existsSync(filePath)) {
        return { exists: true, fullPath: filePath };
      }
    }
    return { exists: false };
  }
};
