const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require('@adiwajshing/baileys')
let fs = require('fs')
let path = require('path')
let fetch = require('node-fetch')
let moment = require('moment-timezone')
let levelling = require('../lib/levelling')
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
    /*conn.sendButton(m.chat, text.trim(), '𝐑-𝐁𝐎𝐓 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏', null, [['DONASI', '.donasi'],['OWNER', '.owner']], m)*/
    conn.sendHydrated(m.chat, text.trim(), `Ⓟ premium | Ⓛ limit\nR-BOT WHATSAPP`, null, 'https://youtube.com/c/RamaGans', '▶️', '', '', [
      ['Donate', '/donasi'],
      ['Owner', '/owner']
    ], m)
    let url = `https://telegra.ph/file/ba5ebc2ac1478114cdbcc.jpg`.trim()
    let res = await fetch(url)
    let buffer = await res.buffer()
    let message = await prepareWAMessageMedia({ image: buffer }, { upload: conn.waUploadToServer })
                const template = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
                    templateMessage: {
                        hydratedTemplate: {
                            imageMessage: message.imageMessage,
                            hydratedContentText: text.trim(),
                            hydratedFooterText:`Ⓟ premium | Ⓛ limit\nR-BOT WHATSAPP`,
                            hydratedButtons: [{
                                urlButton: {
                                    displayText: '▶️',
                                    url: 'https://youtube.com/c/RamaGans'
                                }
                            }, {
                                quickReplyButton: {
                                    displayText: 'Donasi',
                                    id: '/donasi'
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
                conn.relayMessage(m.chat, template.message, { messageId: template.key.id })
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
