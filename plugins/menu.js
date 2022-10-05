const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require('@adiwajshing/baileys')
let fs = require('fs')
let path = require('path')
let fetch = require('node-fetch')
let moment = require('moment-timezone')
let levelling = require('../lib/levelling')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('../lib/myfunc')
let tags = {
  'rpgabsen': 'ʀᴘɢ-ᴀʙsᴇɴ',
  'rpg': 'ʀᴘɢ',
  'game': 'ɢᴀᴍᴇ',
  'xp': 'ᴇxᴘ, ʟɪᴍɪᴛ & ᴘᴀʏ',
  'sticker': 'sᴛɪᴄᴋᴇʀ',
  'main': 'ᴍᴀɪɴ',
  'kerang': 'ᴋᴇʀᴀɴɢ-ᴀᴊᴀɪʙ',
  'quotes': 'ǫᴜᴏᴛᴇs',
  'admin': 'ᴀᴅᴍɪɴ',
  'group': 'ɢʀᴏᴜᴘ',
  'internet': 'ɪɴᴛᴇʀɴᴇᴛ',
  'anonymous': 'ᴀɴᴏɴʏᴍᴏᴜs ᴄʜᴀᴛ',
  'downloader': 'ᴅᴏᴡɴʟᴏᴀᴅᴇʀ',
  'berita': 'ʙᴇʀɪᴛᴀ',
  'tools': 'ᴛᴏᴏʟs',
  'fun': 'ғᴜɴ',
  'database': 'ᴅᴀᴛᴀʙᴀsᴇ', 
  'vote': 'ᴠᴏᴛɪɴɢ',
  'absen': 'ᴀʙsᴇɴ',
  'catatan': 'ᴄᴀᴛᴀᴛᴀɴ',
  'jadian': 'ᴊᴀᴅɪᴀɴ',
  'islami': 'ɪsʟᴀᴍɪ',
  'owner': 'ᴏᴡɴᴇʀ',
  'advanced': 'ᴀᴅᴠᴀɴᴄᴇ',
  'info': 'ɪɴғᴏ',
  'audio': 'ᴀᴜᴅɪᴏ',
  'maker': 'ᴍᴀᴋᴇʀ',
}
const defaultMenu = {
  before: `ʜᴀɪ, %ucapan %name! 👋
 ʙ
▬▬▬「 ᴡᴀᴋᴛᴜ 」▬▬▬
%wib ᴡɪʙ
%wita ᴡɪᴛᴀ
%wit ᴡɪᴛ
►❖ʜᴀʀɪ : %week
►❖ᴛᴀɴɢɢᴀʟ : %date
►❖ᴜᴘᴛɪᴍᴇ : %uptime (%muptime)

▬▬「 ʏᴏᴜʀ sᴛᴀᴛs 」▬▬
►❖ʟɪᴍɪᴛ : %limit
►❖ʟᴇᴠᴇʟ : %level
►❖xᴘ : %exp
%readmore`.trimStart(),
  header: '▰▰▰「 *%category* 」▰▰▰',
  body: '❒➥ *%cmd* %islimit %isPremium',
  footer: '\n',
  after: `ʙʏ
*%npmname* | %version
${'```%npmdesc```'}
`,
}
let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    let package = JSON.parse(await fs.promises.readFile(path.join(__dirname, '../package.json')).catch(_ => '{}'))
    let { exp, limit, level, role } = global.db.data.users[m.sender]
    let { min, xp, max } = levelling.xpRange(level, global.multiplier)
    let name = await conn.getName(m.sender)
    let d = new Date(new Date + 3600000)
    let locale = 'id'
    // d.getTimeZoneOffset()
    // Offset -420 is 18.00
    // Offset    0 is  0.00
    // Offset  420 is  7.00
    const wib = moment.tz('Asia/Jakarta').format("HH:mm:ss")
    const wita = moment.tz('Asia/Makassar').format("HH:mm:ss")
    const wit = moment.tz('Asia/Jayapura').format("HH:mm:ss")
    let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d)
    let time = d.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    })
    let _uptime = process.uptime() * 1000
    let _muptime
    if (process.send) {
      process.send('uptime')
      _muptime = await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      }) * 1000
    }
    let muptime = clockString(_muptime)
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length
    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.tags) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
        enabled: !plugin.disabled,
      }
    })
    for (let plugin of help)
      if (plugin && 'tags' in plugin)
        for (let tag of plugin.tags)
          if (!(tag in tags) && tag) tags[tag] = tag
    conn.menu = conn.menu ? conn.menu : {}
    let before = conn.menu.before || defaultMenu.before
    let header = conn.menu.header || defaultMenu.header
    let body = conn.menu.body || defaultMenu.body
    let footer = conn.menu.footer || defaultMenu.footer
    let after = conn.menu.after || (conn.user.jid == global.conn.user.jid ? '' : `Powered by https://wa.me/${global.conn.user.jid.split`@`[0]}`) + defaultMenu.after
    let _text = [
      before,
      ...Object.keys(tags).map(tag => {
        return header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return body.replace(/%cmd/g, menu.prefix ? help : '%p' + help)
                .replace(/%islimit/g, menu.limit ? '(Ⓛ)' : '')
                .replace(/%isPremium/g, menu.premium ? '(Ⓟ)' : '')
                .trim()
            }).join('\n')
          }),
          footer
        ].join('\n')
      }),
      after
    ].join('\n')
    text = typeof conn.menu == 'string' ? conn.menu : typeof conn.menu == 'object' ? _text : ''
    let replace = {
      '%': '%',
      p: _p, uptime, muptime,
      me: conn.getName(conn.user.jid),
      ucapan: ucapan(),
      npmname: package.name,
      npmdesc: package.description,
      version: package.version,
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      github: package.homepage ? package.homepage.url || package.homepage : '[unknown github url]',
      level, limit, name, weton, week, date, dateIslamic, wib, wit, wita, time, totalreg, rtotalreg, role,
      readmore: readMore
    }
    text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])
  /*let resize = await conn.resize('./anu.jpg', 370, 159)
        return conn.sendButton(m.chat, {
            document: Buffer.alloc(10),
            mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            fileName: 'R-BOT WHATSAPP',
            jpegThumbnail: resize,
            pageCount: 999999999,
            fileLength: 152676504600228322940124967031205376,
            caption: text.trim(),
            footer: `BOT`
            },          
            [{                 
            quickReplyButton: {
            displayText: 'Owner',
            id: '/owner'
             }
            }])*/
function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}            
try {
ppuser = await conn.profilePictureUrl(m.sender, 'image')
} catch (err) {
ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}
let url = `https://telegra.ph/file/ab1df70dfd5c2bac64da1.jpg`.trim()
    let res = await fetch(url)
    let buffer = await res.buffer()
const pporang = await getBuffer(ppuser)       
let fgclink = {key: {fromMe: false,"participant":"0@s.whatsapp.net", "remoteJid": "6289523258649-1604595598@g.us"}, "message": {orderMessage: {itemCount: 9999999,status: 200, thumbnail: pporang, surface: 200, message: `RAMAGANTENG😎`, orderTitle: 'memek', sellerJid: '0@s.whatsapp.net'}}, contextInfo: {"forwardingScore":999,"isForwarded":true},sendEphemeral: true}    
  let link = `https://wa.me/message/4DCK3UGKERTGC1`
let buttonsh = [
{buttonId: `/owner`, buttonText: {displayText: 'OWNER'}, type: 1}
]
let buttonMessage = {
document: fs.readFileSync('./tes.xlsx'),
mimetype: 'application/pdf',
jpegThumbnail:buffer,
fileName: `WA-BOT`,
fileLength: 99999999999999,
caption: text.trim(),
footer: `R-BOT BY RAMA☘️`,
buttons: buttonsh,
headerType: 4,
contextInfo:{externalAdReply:{
title: ``,
body: `WELCOME TO MY BOT`,
mediaType:2,
thumbnail: pporang,
sourceUrl: link,
mediaUrl: link,
}}
}
conn.sendMessage(m.chat, buttonMessage, {quoted:fgclink})      
ajg = fs.readFileSync('./mp3/pe.mp3')
fakyou = fs.readFileSync('./mp3/p.mp3')
anu1 = fs.readFileSync('./mp3/anu1.mp3')
anu2 = fs.readFileSync('./mp3/anu2.mp3')
anu3 = fs.readFileSync('./mp3/anu3.mp3')
anu4 = fs.readFileSync('./mp3/anu4.mp3')
 nyong = pickRandom([ajg, fakyou, anu1, anu2, anu3, anu4])
conn.sendMessage(m.chat, {audio: nyong, mimetype: 'audio/mpeg', ptt:true }, {quoted:m})            
/*            
    conn.sendButton(m.chat, text.trim(), 'Made with ♡ by Aine', null, [['Donasi', '.donasi'],['Owner', '.owner']], m)
    /*conn.sendHydrated(m.chat, text.trim(), 'Ⓟ premium | Ⓛ limit', null, 'https://aiinne.github.io/', 'Website', '', '', [
      ['Donate', '/donasi'],
      ['Sewa Bot', '/sewa'],
      ['Owner', '/owner']
    ], m)*/
    /*let url = `https://telegra.ph/file/ab1df70dfd5c2bac64da1.jpg`.trim()
    let res = await fetch(url)
    let buffer = await res.buffer()
    let message = await prepareWAMessageMedia({ image: buffer }, { upload: conn.waUploadToServer })
                const template = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
                    templateMessage: {
                        hydratedTemplate: {
                            imageMessage: message.imageMessage,
                            hydratedContentText: text.trim(),
                            hydratedFooterText:'Ⓟ premium | Ⓛ limit',
                            hydratedButtons: [{
                                urlButton: {
                                    displayText: 'Website',
                                    url: 'https://Ainebot.github.io/'
                                }
                            }, {
                                quickReplyButton: {
                                    displayText: 'Donasi',
                                    id: '/donasi'
                                }
                            }, {
                                quickReplyButton: {
                                    displayText: 'Sewa',
                                    id: '/sewa'
                                }  
                            }, {
                                quickReplyButton: {
                                    displayText: 'Owner',
                                    id: '/owner'
                                }
                            }]
                        }
                    }
                }), { userJid: m.chat, quoted: m })
                conn.relayMessage(m.chat, template.message, { messageId: template.key.id })*/
  } catch (e) {
    conn.reply(m.chat, 'Maaf, menu sedang error', m)
    throw e
  }
}
handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|help|\?)$/i

handler.exp = 3

module.exports = handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

function ucapan() {
        const hour_now = moment.tz('Asia/Jakarta').format('HH')
        var ucapanWaktu = 'Pagi kak'
        if (hour_now >= '03' && hour_now <= '10') {
          ucapanWaktu = 'Pagi kak'
        } else if (hour_now >= '10' && hour_now <= '15') {
          ucapanWaktu = 'Siang kak'
        } else if (hour_now >= '15' && hour_now <= '17') {
          ucapanWaktu = 'Sore kak'
        } else if (hour_now >= '17' && hour_now <= '18') {
          ucapanWaktu = 'Selamat Petang kak'
        } else if (hour_now >= '18' && hour_now <= '23') {
          ucapanWaktu = 'Malam kak'
        } else {
          ucapanWaktu = 'Selamat Malam!'
        }	
        return ucapanWaktu
}
