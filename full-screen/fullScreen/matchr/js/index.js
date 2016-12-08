(function() {
  var matches = [];

  function checkMatchesForDupes(letter) {
    for (i = 0; i < matches.length; i++) {
      if (matches[i].letter === letter) {
        return true;
      }
    }
    return false;
  }

  function matchStrings(w1, w2) {
    matches = [];
    for (var i = 0; i < w1.length; i++) {
      var letter1 = w1.charAt(i);
      for (var n = 0; n < w2.length; n++) {
        var letter2 = w2.charAt(n);
        if (letter1 === letter2 && !checkMatchesForDupes(letter1)) {
          console.log(letter1);
          matches.push({
            letter: letter1,
            w1Position: i,
            w2Position: n
          });
        }
      }
    }

    console.log(matches);
  }

  // UI and DOM Business

  var matchBtn = document.getElementById('match-btn');

  matchBtn.addEventListener('click', function() {
    var wordOne = document.getElementById('first-word').value;
    var wordTwo = document.getElementById('second-word').value;
    matchStrings(wordOne, wordTwo);
    var results = document.getElementById('results');
    var pStart = '<p>';
    var pEnd = '</p>';
    var matchesText = '<hr>' + pStart + ' ' + wordOne + ' and ' + wordTwo + ' have ' + matches.length + ' unique matching letters' + pEnd + '<ul>';

    for (var i = 0; i < matches.length; i++) {
      matchesText += '<li>' + matches[i].letter + '</li>';
    }

    matchesText += '</ul>';
    results.innerHTML = matchesText;
  }, false);

  //   Canvas bg

  var canvas = document.getElementById("room");
  var ctx = canvas.getContext("2d");

  var numberOfParticles = 50;
  var pageW = window.innerWidth;
  var pageH = window.innerHeight;
  canvas.width = pageW;
  canvas.height = pageH;

  var dust = [];

  for (i = 0; i < numberOfParticles; i++) {
    dust.push(new createSpec());
  }

  function createSpec() {
    this.x = Math.random() * pageW;
    this.y = Math.random() * pageH;
    this.radius = Math.random() * (100) + 50;
    this.fade = false;

    this.returnYStart = function() {
      return this.y;
    };
    this.yStart = this.returnYStart();

    this.animateSpeed = Math.random() * (0.1 - 0.01) + 0.01;
    this.moveX = Math.random() * 2;
    this.xLeft = Math.random() * 1;
    this.yMaxArch = Math.random() * 100;
    this.yAmountLeft = 1;
    this.moveY = this.yAmountLeft;
  }

  function onresize() {
    pageW = window.innerWidth;
    pageH = window.innerHeight;
    canvas.width = pageW;
    canvas.height = pageH;
    dust = [];

    for (i = 0; i < numberOfParticles; i++) {
      dust.push(new createSpec());
    }
  }

  function updateSpec(spec) {
    if (spec.xLeft > 0.5) {
      spec.x += spec.moveX;
    }
    if (spec.xLeft < 0.5) {
      spec.x -= spec.moveX;
    }
    if (spec.x > pageW || spec.x < 0) {
      spec.moveX *= -1;
    }

    var yCurrentOffSet = Math.abs(spec.y - spec.yStart);
    var yArchRatio = yCurrentOffSet / spec.yMaxArch;
    if (yCurrentOffSet > spec.yMaxArch) {
      spec.moveY *= -1;
    }
    spec.y += spec.moveY;
  }

  function draw() {
    window.addEventListener('resize', onresize);
    ctx.clearRect(0, 0, pageW, pageH);
    for (var t = 0; t < dust.length; t++) {
      var s = dust[t];
      ctx.beginPath();

      var gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius);
      gradient.addColorStop(0.3, "rgba(250, 250, 245, 0.6)");
      gradient.addColorStop(1, 'rgba(250, 250, 250, 0.000)');

      ctx.fillStyle = gradient;
      ctx.arc(s.x, s.y, s.radius, Math.PI * 2, false);
      ctx.fill();

      if (s.fade && s.radius > s.radiusFloor) {
        s.radius -= s.animateSpeed;
      } else if (!s.fade && s.radius <= s.radiusCeiling) {
        s.radius += s.animateSpeed;
      } else if (s.radius < s.radiusFloor) {
        s.radius += s.animateSpeed;
        s.fade = false;
        s.animateSpeed = Math.random() * (0.1 - 0.01) + 0.1;
      } else if (s.radius > s.radiusCeiling) {
        s.radius -= s.animateSpeed;
        s.fade = true;
      }

      updateSpec(s);
    }
  }

  setInterval(draw, 60);
}());