function confirm_alert(source) {
  if (source && source != '') {
    var text = translations.general.alert
    return confirm(text + source + '.');
  } else {
    var text = translations.general.alert_general
    return confirm('Sie verlassen unsere Webseite!\nDer Link führt Sie zu einer externen Webseite.')
  }
}