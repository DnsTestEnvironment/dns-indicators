//
opensdg.dataRounding = function(value, dcmplc) {
  if (value == null) {
    return value
  }
  else {
    return (+(Math.round(+(value + 'e' + dcmplc)) + 'e' + -dcmplc)).toFixed(dcmplc);
  }
};
//------------------------------------------------
