function confirm_alert(source) {
  if (source && source != {
    var text = 'Sie verlassen unsere Webseite!\nDer Link führt Sie zur Webseite '
    return confirm(text + source + '.');
  } else {
    return confirm('Sie verlassen unsere Webseite!\nDer Link führt Sie zu einer externen Webseite.')
  }
}
