// Config
let config = {
    channelname: 'elraenn',
    max_node_limit: 70,
    assets_dir_name: 'assets'
}
// Get cookie/cookies for change config
let settingCookies = ['channelname']
settingCookies.forEach(cookieName => {
    let cookie = getCookie(cookieName)
    if (cookie != null && cookie != undefined && cookie != '') {
        config[cookieName] = cookie
    }
})
let cookie_config = {
    close_user_badges: 'close_user_badges',
    close_user_colors: 'close_user_colors',
    close_animation: 'close_animation',
    max_node_limit: 'max_node_limit'
}
// Tmi - Twitch connection
const client = new tmi.Client({
    connection: {
        reconnect: true,
        secure: true
    },
    channels: [config.channelname]
})
client.connect().catch(console.error)
// Change navbar title
$('#navbar-title').text('#'+config.channelname)
// Chat
const chatEl = document.getElementById('chat')
const chatID = 'chat'
// Checking nodes for chat node limit
function checkNodes() {
    let maxNodeLimit
    if (getCookie('max_node_limit') == null) {
        maxNodeLimit = config.max_node_limit
    } else {
        maxNodeLimit = getCookie('max_node_limit')
    }
    let manyNodesAreInChat = chat.childElementCount
    if (manyNodesAreInChat >= maxNodeLimit) {
        chatEl.removeChild(document.getElementById(chatID).firstElementChild)
    }
} 
// Adding badges
let badges = {
    broadcaster: 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1',
    premium: 'https://static-cdn.jtvnw.net/badges/v1/bbbe0db0-a598-423e-86d0-f9fb98ca1933/1',
    vip: 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/1',
    partner: 'https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/1',
    glitchcon2020: 'https://static-cdn.jtvnw.net/badges/v1/1d4b03b9-51ea-42c9-8f29-698e3c85be3d/1',
    moderator: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1',
    subscriber: `${config['assets_dir_name']}/sub1.png`,
    'glhf-pledge': 'https://static-cdn.jtvnw.net/badges/v1/3158e758-3cb4-43c5-94b3-7639810451c5/1',
    'sub-gifter': 'https://static-cdn.jtvnw.net/badges/v1/f1d8486f-eb2e-4553-b44f-4d614617afc1/1'
}
function getBadgesHTML(user) {
    let badgeHTML = ''
    let userBadges = user['badges']
    let userBadgesInfo = user['badge-info']
    if (userBadges != null) {
        for (const [badgeName, badgeImgSrc] of Object.entries(badges)) {
            for (const userBadgeName of Object.keys(userBadges)) {
                if (userBadgeName == badgeName) {
                    let imgTitle = ''
                    if (badgeName == 'subscriber') {
                        imgTitle = `${userBadgesInfo.subscriber} month subscription`
                    }
                    badgeHTML = badgeHTML + `<img style="margin-right: 5px;" title="${imgTitle}" src="${badgeImgSrc}">`
                }
            }
        }
    }
    return badgeHTML
}
// Filter the message for replied messages
function filterMessage(rawMessage, user) {
    let repliedUser = user['reply-parent-display-name']
    let filteredMessage = rawMessage
    if (repliedUser) {
        let cutTheRawMessage = `@${repliedUser} `
        filteredMessage = rawMessage.slice(cutTheRawMessage.length)
    }
    return filteredMessage
}
// Creating chat node, example: 'user823: hello everyone!'
function createChatNode(data) {
    let rawMessage = data.rawMessage
    let whereToAdd = data.whereToAdd
    let userData = data.userData
    let username = userData['display-name']
    let message = filterMessage(rawMessage, userData)
    let userColor = 'white'
    let badgesHTML = ''
    let animationClass = 'no-anim'
    if (getCookie(cookie_config.close_user_colors) == 'false') {
        userColor = userData['color']
    }
    if (getCookie(cookie_config.close_user_badges) == 'false') {
        badgesHTML = getBadgesHTML(userData)
    }
    if (getCookie(cookie_config.close_animation) == 'false') {
        animationClass = 'node-anim'
    }
    let inner_card = '<div class="card-body"><div class="node-head" style="color: ' + userColor + ';">' + badgesHTML + username + '</div><div class="node-body">' + message + '</div></div>'
    $('#' + whereToAdd).append('<div class="card node '+animationClass+' mt-2 mb-2 text-light rounded-3 shadow border-0">' + inner_card + '</div>')
}
// Creating system message node, example: 'Connected to channel!'
function createSystemNode(data) {
    let message = data.message
    let whereToAdd = data.whereToAdd
    let animationClass = 'no-anim'
    if (getCookie(cookie_config.close_animation) == 'false') {
        animationClass = 'node-anim'
    }
    $('#' + whereToAdd).append('<div class="card system-node node '+animationClass+' mt-2 mb-2 text-light rounded-3 shadow"><div class="card-body">' + message + '</div></div>')
}
// Creating node
function createNode(data) {
    let nodeType = data.nodeType
    let rawMessage = data.rawMessage
    let user = data.user
    const isScrolledToBottom = chatEl.scrollHeight - chatEl.clientHeight <= chatEl.scrollTop + 5
    checkNodes()
    // If node is chatnode, create it
    if (nodeType == 'chatnode') {
        // Adding the Author name & Message
        createChatNode({
            rawMessage: rawMessage,
            whereToAdd: chatID,
            userData: user
        })
    } else {
        createSystemNode({
            message: rawMessage,
            whereToAdd: chatID
        })
    }
    if (isScrolledToBottom) {
        chatEl.scrollTop = chatEl.scrollHeight - chatEl.clientHeight
    }
}
// Chat messages
client.on('message', (channel, user, rawMessage, self) => {
    if (self) return;
    createNode({
        nodeType: 'chatnode',
        rawMessage: rawMessage,
        user: user
    })
})
// Functions for system nodes, example: 'Connected to channel!'
client.on('connected', () => {
    createNode({
        nodeType: 'systemnode',
        rawMessage: `Connected to ${config.channelname}!`
    })
})
client.on('disconnected', () => {
    createNode({
        nodeType: 'systemnode',
        rawMessage: 'Reconnecting...'
    })
})
client.on('clearchat', () => {
    createNode({
        nodeType: 'systemnode',
        rawMessage: 'Chat cleared!'
    })
})
client.on('clearmsg', (login, message) => {
    createNode({
        nodeType: 'systemnode',
        rawMessage: `${login}'s '${message}' message has been deleted.`
    })
})
client.on('messagedeleted', (channel, username, deletedMessage, userstate) => {
    createNode({
        nodeType: 'systemnode',
        rawMessage: `${username}'s '${deletedMessage}' message has been deleted.`
    })
})
client.on('notice', (msgid, message) => {
    createNode({
        nodeType: 'systemnode',
        rawMessage: `msgid: ${msgid}, message: ${message}`
    })
    if (message == 'msg_channel_suspended') {
        window.location.href = '/'
    }
})
client.on('emoteonly', (channel, enabled) => {
    if (enabled) {
        createNode({
            nodeType: 'systemnode',
            rawMessage: 'Emote only enabled!'
        })
    } else {
        createNode({
            nodeType: 'systemnode',
            rawMessage: 'Emote only is no longer on.'
        })
    }
})
client.on('ban', (channel, username, reason, userstate) => {
    let reason_filtered = ''
    if (reason != null) {
        reason_filtered = `reason: ${reason}`
    }
    createNode({
        nodeType: 'systemnode',
        rawMessage: `${username}'s banned! ${reason_filtered}`
    })
})
client.on('timeout', (channel, username, reason, duration, userstate) => {
    let duration_filtered = ''
    let reason_filtered = ''
    if (duration != null) {
        duration_filtered = `duration: ${duration}`
    }
    if (reason != null) {
        reason_filtered = `reason: ${reason}`
    }
    createNode({
        nodeType: 'systemnode',
        rawMessage: `${username}'s timeouted! ${duration_filtered}, ${reason_filtered}`
    })
})
client.on('followersonly', (channel, enabled, length) => {
    if (enabled) {
        createNode({
            nodeType: 'systemnode',
            rawMessage: 'Followers only enabled!'
        })
    } else {
        createNode({
            nodeType: 'systemnode',
            rawMessage: 'Followers only is no longer on.'
        })
    }
})
client.on('mod', (channel, username) => {
    createNode({
        nodeType: 'systemnode',
        rawMessage: `${username}'s modded!`
    })
})
client.on('unmod', (channel, username) => {
    createNode({
        nodeType: 'systemnode',
        rawMessage: `${username}'s unmoded!`
    })
})
client.on('slowmode', (channel, enabled, length) => {
    if (enabled) {
        createNode({
            nodeType: 'systemnode',
            rawMessage: `Slowmode is on, slow: ${length}`
        })
    } else {
        createNode({
            nodeType: 'systemnode',
            rawMessage: 'Slowmode only is no longer on.'
        })
    }
})