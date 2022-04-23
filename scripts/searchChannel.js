function searchChannel() {
    let channelNameInput = $('#search_channel').val()
    setCookie('channelname', channelNameInput)
    location.reload()
}