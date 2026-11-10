
(function () {
  'use strict';
  var WA = 'https://wa.me/375298099191';
  var SEASON = {
    summer: ['Летний комплект', 'Ставим, когда устойчиво выше +7 °C: летняя резина на холоде дубеет, тормозной путь растёт.',
      ['проверить остаток протектора и боковины', 'проверить давление после смены', 'осмотреть диски на биение', 'проверить вентили на герметичность']],
    winter: ['Зимний комплект', 'Меняем до первых устойчивых заморозков: при +7 °C и ниже зимняя резина работает лучше летней.',
      ['проверить шипы и остаток протектора', 'проверить давление и герметичность', 'осмотреть боковины после лета', 'проверить вентили и посадку']],
    between: ['Межсезонье', 'Граница +7 °C: утром минус, днём плюс. В это время чаще всего ловят вибрацию и медленный спуск.',
      ['проверить давление — перепад температур даёт разницу', 'проверить балансировку при вибрации', 'осмотреть порезы после бордюров', 'проверить вентили и посадку']]
  };
  var ZONES = {
    tread: ['Протектор', 'Рабочая зона: остаток глубины, неравномерный износ, порезы между блоками.',
      'Ремонт возможен, если повреждение в пределах протектора и корд не задет. Решение — после осмотра.',
      ['замер остатка протектора', 'поиск порезов и грыж', 'проверка равномерности износа']],
    shoulder: ['Плечевая зона', 'Граница протектора и боковины: здесь чаще всего появляются порезы от бордюров.',
      'Плечо нагружено, поэтому ремонт делаем только после осмотра и не всегда возможен.',
      ['осмотр порезов', 'проверка корда', 'оценка целесообразности ремонта']],
    sidewall: ['Боковина', 'Тонкая часть шины: грыжи, порезы, следы удара о бордюр, маркировка.',
      'Порез или грыжа на боковине чаще означают замену: корд здесь не восстанавливается надёжно.',
      ['осмотр грыж и порезов', 'проверка маркировки и размеров', 'проверка даты выпуска']],
    bead: ['Посадочное кольцо', 'Место посадки на диск: подтёки, коррозия, повреждение борта при монтаже.',
      'Если борт повреждён, шина может травить по посадке. Проверяем герметичность после монтажа.',
      ['осмотр борта и посадки', 'очистка посадочного места', 'проверка на утечку']],
    rim: ['Диск', 'Биение, вмятины от ям, коррозия по кромке, состояние крепёжных отверстий.',
      'Биение диска не лечится балансировкой: сначала оцениваем сам диск.',
      ['проверка биения', 'осмотр кромки и отверстий', 'контроль после установки']],
    valve: ['Вентиль', 'Трещины резины, травящий золотник, окисление — частая причина медленного спуска.',
      'Меняется быстро: если вентиль старый, лучше заменить при смене комплекта.',
      ['проверка герметичности', 'осмотр резины вентиля', 'замена при необходимости']]
  };

  function initDrawer() {
    var d = document.getElementById('drawer');
    var b = document.querySelector('.header .burger');
    if (!d || !b) return;
    var last = null;
    function open() {
      last = document.activeElement;
      d.hidden = false; d.setAttribute('data-open', '');
      b.setAttribute('aria-expanded', 'true');
      document.body.classList.add('is-locked');
      var f = d.querySelector('a, button'); if (f) f.focus({ preventScroll: true });
    }
    function close() {
      d.hidden = true; d.removeAttribute('data-open');
      b.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked');
      if (last) last.focus({ preventScroll: true });
    }
    b.addEventListener('click', function () { d.hidden ? open() : close(); });
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]') || e.target.closest('a') || !e.target.closest('.drawer__in')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !d.hidden) close();
      if (e.key === 'Tab' && !d.hidden) {
        var it = d.querySelectorAll('a, button, input');
        if (!it.length) return;
        var f = it[0], l = it[it.length - 1];
        if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus(); }
        else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus(); }
      }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1024 && !d.hidden) close(); });
  }

  function initSeason() {
    var box = document.getElementById('sb');
    if (!box) return;
    var t = document.getElementById('sT'), tx = document.getElementById('sTxt'), k = document.getElementById('sK'), l = document.getElementById('sL');
    function show(s) {
      var d = SEASON[s];
      k.textContent = 'СЕЗОН · ' + d[0].toUpperCase();
      t.textContent = d[0];
      tx.textContent = d[1];
      l.innerHTML = d[2].map(function (x) { return '<li>' + x + '</li>'; }).join('');
      [].forEach.call(box.children, function (c) { c.classList.toggle('is-on', c.getAttribute('data-s') === s); });
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.sbtn'); if (!b) return;
      show(b.getAttribute('data-s'));
    });
    show('summer');
  }

  function initCalc() {
    var host = document.getElementById('calc');
    if (!host) return;
    var dBox = document.getElementById('cD'), sBox = document.getElementById('cS'), nBox = document.getElementById('cN'), xBox = document.getElementById('cX');
    var out = {
      price: document.getElementById('cPrice'), meta: document.getElementById('cMeta'),
      flag: document.getElementById('cFlag'), send: document.getElementById('cSend'),
      lD: document.getElementById('lD'), lS: document.getElementById('lS'), lN: document.getElementById('lN')
    };
    var st = { d: 16, s: '205/55', n: 4, x: [] };
    var lowProfile = ['225/45', '235/35'];
    var WORKS = ['снятие и установка колёс', 'демонтаж и монтаж шин', 'балансировка каждого колеса', 'затяжка и проверка давления'];

    function draw() {
      var price = null, flags = [];
      var standard = st.x.indexOf('van') === -1 && st.x.indexOf('runflat') === -1 && !(lowProfile.indexOf(st.s) > -1) && st.x.indexOf('low') === -1;
      if (st.d <= 14 && standard) price = 50;
      else if (st.d >= 15 && st.d <= 16 && standard) price = 60;
      if (st.d >= 17) flags.push('R' + (st.d === 20 ? '20 и выше' : st.d) + ' — крупный диск, стоимость уточняем');
      if (st.x.indexOf('van') > -1) flags.push('микроавтобус — уточняем');
      if (st.x.indexOf('runflat') > -1) flags.push('RunFlat — уточняем');
      if (lowProfile.indexOf(st.s) > -1 || st.x.indexOf('low') > -1) flags.push('низкопрофильные шины — уточняем');
      if (st.n < 4) flags.push('цена указана за комплекс из 4 колёс: для ' + st.n + ' колеса посчитаем при записи');
      if (st.x.indexOf('puncture') > -1) flags.push('ремонт прокола — после осмотра повреждения');

      out.price.textContent = price ? 'от ' + price : 'уточним';
      out.meta.textContent = 'R' + (st.d === 20 ? '20+' : st.d) + ' · ' + st.s + ' · ' + (st.n === 4 ? 'комплект 4 колеса' : st.n + (st.n === 1 ? ' колесо' : ' колеса'));
      out.lD.textContent = 'R' + (st.d === 20 ? '20+' : st.d);
      out.lS.textContent = st.s;
      out.lN.textContent = st.n === 4 ? '4 колеса' : st.n + (st.n === 1 ? ' колесо' : ' колеса');
      if (flags.length) {
        out.flag.hidden = false;
        out.flag.textContent = flags.join('; ');
      } else {
        out.flag.hidden = true;
        out.flag.textContent = '';
      }
      var msg = 'Запись в шиномонтаж с сайта (Макаёнка 11).\nРазмер: ' + st.s + ' R' + (st.d === 20 ? '20+' : st.d) +
        '\nКолёс: ' + st.n + (st.x.length ? '\nДополнительно: ' + st.x.map(function (k) {
          return k === 'van' ? 'микроавтобус' : k === 'low' ? 'низкопрофиль' : k === 'runflat' ? 'RunFlat' : 'ремонт прокола';
        }).join(', ') : '') + '\nРабота: ' + WORKS.join(', ') + '\nОриентир: ' + (price ? 'от ' + price + ' руб за комплекс' : 'уточнить');
      out.send.href = WA + '?text=' + encodeURIComponent(msg);
    }
    dBox.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      [].forEach.call(dBox.children, function (c) { c.classList.toggle('is-on', c === b); });
      st.d = +b.getAttribute('data-v'); draw();
    });
    sBox.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      [].forEach.call(sBox.children, function (c) { c.classList.toggle('is-on', c === b); });
      st.s = b.getAttribute('data-v'); draw();
    });
    nBox.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      [].forEach.call(nBox.children, function (c) { c.classList.toggle('is-on', c === b); });
      st.n = +b.getAttribute('data-v'); draw();
    });
    xBox.addEventListener('change', function () {
      st.x = [].slice.call(xBox.querySelectorAll('input:checked')).map(function (i) { return i.getAttribute('data-k'); });
      draw();
    });
    draw();
  }

  function initCheck() {
    var host = document.querySelector('.wheel');
    if (!host) return;
    var out = {
      k: document.getElementById('zK'), t: document.getElementById('zT'), p: document.getElementById('zP'),
      v: document.getElementById('zV'), l: document.getElementById('zL'), s: document.getElementById('zSend')
    };
    var zs = [].slice.call(host.querySelectorAll('.zc'));
    function show(z) {
      var d = ZONES[z];
      out.k.textContent = 'ЗОНА · ' + d[0].toUpperCase();
      out.t.textContent = d[0];
      out.p.textContent = d[1];
      out.v.innerHTML = '<b>Можно ли ремонтировать:</b> ' + d[2];
      out.l.innerHTML = d[3].map(function (x) { return '<li>' + x + '</li>'; }).join('');
      out.s.href = WA + '?text=' + encodeURIComponent('Запись в шиномонтаж с сайта (Макаёнка 11).\nЗона повреждения: ' + d[0] + '\nРазмер шин: ');
      zs.forEach(function (g) { g.classList.toggle('is-on', g.getAttribute('data-z') === z); });
    }
    zs.forEach(function (g) {
      g.addEventListener('click', function () { show(g.getAttribute('data-z')); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(g.getAttribute('data-z')); } });
    });
    show('tread');
  }

  function initBrands() {
    var q = document.getElementById('bq');
    var list = document.getElementById('blist');
    if (!q || !list) return;
    var items = [].slice.call(list.children);
    var cnt = document.getElementById('bCnt'), empty = document.getElementById('bEmpty');
    function filter() {
      var v = q.value.trim().toLowerCase(), shown = 0;
      items.forEach(function (it) {
        var ok = !v || it.getAttribute('data-b').indexOf(v) > -1;
        it.hidden = !ok;
        if (ok) shown++;
      });
      if (cnt) cnt.textContent = 'показано ' + shown + ' из ' + items.length;
      if (empty) empty.hidden = shown > 0;
    }
    q.addEventListener('input', filter);
    filter();
  }

  function initLead() {
    var f = document.getElementById('lead');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = document.getElementById('lName'), t = document.getElementById('lTel'), c = document.getElementById('lCar'), k = document.getElementById('lTask');
      var bad = false;
      [n, t].forEach(function (el) { if (!el.value.trim()) { el.style.borderColor = '#C0331C'; bad = true; } else { el.style.borderColor = ''; } });
      if (bad) return;
      var msg = 'Запись в шиномонтаж с сайта (Макаёнка 11).\nИмя: ' + n.value.trim() + '\nТелефон: ' + t.value.trim() +
        (c.value.trim() ? '\nАвто и размер: ' + c.value.trim() : '') + (k.value.trim() ? '\nРабота: ' + k.value.trim() : '');
      window.open(WA + '?text=' + encodeURIComponent(msg), '_blank');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDrawer(); initSeason(); initCalc(); initCheck(); initBrands(); initLead();
    var y = document.getElementById('yr'); if (y) y.textContent = new Date().getFullYear();
  });
})();
