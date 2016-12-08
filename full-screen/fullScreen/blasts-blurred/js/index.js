var final = "";
var vh = window.innerHeight;
var vw = window.innerWidth;
var count = 12;

function a(x) {
  var s = '<div class="p p' + x + '"   style="';
  var s3 = "></div>";
  for (var i = 0; i < count; i++) {
    var h = Math.random() * 300;
    var s2 = "width:" + h + "px;height:" + h + "px;";

    var x = Math.random() * (vw - h);
    var y = Math.random() * (vh - h);
    var blur = Math.random() * 30;
    var pos = "left:" + x + "px;top:" + y + "px;filter: blur(" + blur + 'px)"';
    final += s + s2 + pos + s3;

  }
}

a(1);
a(2);
a(3);
a(4);
a(5);
a(6);
document.getElementsByTagName('body')[0].innerHTML = final;