function searchChannel() {
    let channelNameInput = $('#search_channel').val()
    setCookie('channelname', channelNameInput)
    window.location.replace(location.pathname)
}