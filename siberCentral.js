const express = require('express');
const axios = require('axios');
const ejs = require("ejs");
const path = require("path");
const bodyParser = require('body-parser')
const app = express();
const port = 3000;
const botToken = '';

const headers = {
  'Authorization': `Bot ${botToken}`,
}
app.use(bodyParser.urlencoded({
  extended: true
}))

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use('/assets', express.static(path.join(__dirname, './views/assets')));

app.get('/', (req, res) => {
  res.render('queryid.ejs',  {
    requestType: "GET"
  });
});
app.get('/queryid', (req, res) => {
  res.render('queryid.ejs',  {
    requestType: "GET"
  });
});

app.post('/getuserinfo', async (req, res) => {
  const { userId } = req.body;

  try {
      const response = await axios.get(`https://discord.com/api/v8/users/${encodeURIComponent(userId)}`, { headers });
      const userData = response.data;

      const guildNames = await checkUserMembership(userId);
      
      if (guildNames.length > 0) {
        res.render('queryid.ejs', { userData, requestType: "POST", isMember: true, guildNames });
      } else {
        res.render('queryid.ejs', { userData, requestType: "POST", isMember: false, guildNames});
      }
    } catch (error) {
      res.render('queryid.ejs', { userData: null, requestType: "POST", isMember: false, guildNames: []});
    }
});



app.listen(port, () => {
  console.log(`${port} aktif amcık`);
});



















async function checkUserMembership(userIdToCheck) {
  try {
    const guildsResponse = await axios.get(`https://discord.com/api/v10/users/@me/guilds`, { headers });
    const guilds = guildsResponse.data;
    
    const guildNames = [];
    
    for (const guild of guilds) {
      const guildId = guild.id;
      const guildName = guild.name;
      const guildIconURL = guild.icon ? `https://cdn.discordapp.com/icons/${guildId}/${guild.icon}.png` : null;
      const guildMembersResponse = await axios.get(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, { headers });
      const guildMembers = guildMembersResponse.data;

      for (const member of guildMembers) {
        if (member.user.id === userIdToCheck) {
          guildNames.push(guildName);
        }
      }
    }
    
    return guildNames;
  } catch (error) {
    console.error(error);
    return [];
  }
}