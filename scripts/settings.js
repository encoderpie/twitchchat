function save_settings() {
    let changedSettings = {}
    let inputs = $('#settings').find('input')
    for (const [title, inputEl] of Object.entries(inputs)) {
        if (title != 'length') {
            let setting_title = $(inputEl).attr('title')
            let setting_name = $(inputEl).attr('name')
            let setting_type = $(inputEl).attr('type')
            let setting_value
            if (setting_type == 'checkbox') {
                setting_value = inputEl.checked
            } else if (setting_type == 'number') {
                setting_value = $(inputEl).val()
            }
            if (getCookie(setting_name) != `${setting_value}`) {
                if (setting_name == 'hidden_navbar' && setting_value === true) {
                    $('#nav').css('display', 'none')
                    $('#chat').css('height', '100vh')
                } else {
                    setCookie(setting_name, setting_value)
                }
                changedSettings[setting_name] = {'text': setting_title, 'value': setting_value}
            }
        } else {
            break
        }
    }
    let changedSettingsText = ''
    for (const [name, details] of Object.entries(changedSettings)) {
        let settingText = details.text
        let settingValue = details.value
        if (name == 'max_node_limit') {
            changedSettingsText = changedSettingsText + settingText + ', is set to ' + settingValue + '<br>'
        } else {
            let settingInfo = 'setting turned off.'
            if (details.value == true) {
                settingInfo = 'setting turned on.'
            }
            changedSettingsText = changedSettingsText + settingText + ' ' + settingInfo + '<br>'
        }
    }
    if (changedSettingsText != '') {
        createNode({
            nodeType: 'systemnode',
            rawMessage: 'Settings have been changed:<br>' + changedSettingsText
        })
    }
    $('#settingsModal').modal('hide')
}