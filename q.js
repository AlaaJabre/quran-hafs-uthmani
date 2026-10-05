// Quran reader widget. Usage: <div id="qr"></div><script src=".../q.js"></script><script>Q('phrase')</script>
// Q('phrase') searches and shows 11 ayat; Q('@next') continues after the last shown ayah (if the browser kept it).
(function () {
  var SRC = 'https://cdn.jsdelivr.net/gh/AlaaJabre/quran-hafs-uthmani@main/quran-hafs-uthmani.json';
  var S = "الفاتحة البقرة آل_عمران النساء المائدة الأنعام الأعراف الأنفال التوبة يونس هود يوسف الرعد إبراهيم الحجر النحل الإسراء الكهف مريم طه الأنبياء الحج المؤمنون النور الفرقان الشعراء النمل القصص العنكبوت الروم لقمان السجدة الأحزاب سبأ فاطر يس الصافات ص الزمر غافر فصلت الشورى الزخرف الدخان الجاثية الأحقاف محمد الفتح الحجرات ق الذاريات الطور النجم القمر الرحمن الواقعة الحديد المجادلة الحشر الممتحنة الصف الجمعة المنافقون التغابن الطلاق التحريم الملك القلم الحاقة المعارج نوح الجن المزمل المدثر القيامة الإنسان المرسلات النبأ النازعات عبس التكوير الانفطار المطففين الانشقاق البروج الطارق الأعلى الغاشية الفجر البلد الشمس الليل الضحى الشرح التين العلق القدر البينة الزلزلة العاديات القارعة التكاثر العصر الهمزة الفيل قريش الماعون الكوثر الكافرون النصر المسد الإخلاص الفلق الناس".split(' ').map(function (x) { return x.replace('_', ' '); });
  function A(n) { return String(n).replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }); }
  function nm(s) {
    return s.replace(/وٰ/g, 'ا').replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '')
      .replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/[ءاىيو]/g, '').replace(/\s+/g, ' ').trim();
  }
  function sur(v) { return +v.verse_key.split(':')[0]; }
  function save(k) { try { localStorage.setItem('qr_last', k); } catch (e) {} }
  function load() { try { return localStorage.getItem('qr_last'); } catch (e) { return null; } }

  var lnk = document.createElement('link');
  lnk.rel = 'stylesheet';
  lnk.href = 'https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap';
  document.head.appendChild(lnk);

  window.Q = async function (P) {
    var root = document.getElementById('qr') || document.body.appendChild(document.createElement('div'));
    root.dir = 'rtl';
    root.style.padding = '1rem 0';
    root.innerHTML =
      '<div id="qh" style="font-size:15px;color:var(--text-secondary);margin-bottom:12px">جاري التحميل...</div>' +
      '<div id="qo"></div>' +
      '<p id="qq" style="font-family:\'Amiri Quran\',serif;font-size:34px;line-height:2.4;text-align:justify;color:var(--text-primary);margin:0"></p>' +
      '<div id="qf" style="font-size:13px;color:var(--text-muted);margin-top:8px"></div>' +
      '<button id="qn" style="display:none;margin-top:10px;font-size:15px">تالي</button>';
    var h = root.querySelector('#qh'), o = root.querySelector('#qo'), q = root.querySelector('#qq'),
      f = root.querySelector('#qf'), nb = root.querySelector('#qn');
    var t0 = performance.now(), D;
    try { D = (await (await fetch(SRC)).json()).verses; }
    catch (e) { h.textContent = 'تعذر تحميل النص من المصدر'; return; }
    var tl = ((performance.now() - t0) / 1000).toFixed(1);
    var shown = [], np = '';

    function foot() {
      var s = sur(shown[0]), pg = [];
      shown.forEach(function (v) { if (pg.indexOf(v.page_number) < 0) pg.push(v.page_number); });
      f.textContent = S[s - 1] + ' ' + A(shown[0].verse_number) + ' إلى ' + A(shown[shown.length - 1].verse_number) +
        ' | الصفحات: ' + pg.map(A).join('، ') +
        (np && !nm(shown[0].text_uthmani).startsWith(np) ? ' | العبارة من وسط الآية' : '') +
        ' | تحميل الملف: ' + A(tl) + ' ث';
    }
    function txt(r) { return r.map(function (v) { return v.text_uthmani + ' ﴿' + A(v.verse_number) + '﴾'; }).join(' '); }
    function head(v) { h.textContent = 'السورة: ' + S[sur(v) - 1] + ' | رقم الآية: ' + A(v.verse_number) + ' | رقم الصفحة: ' + A(v.page_number); }
    function show(i, n) {
      o.innerHTML = '';
      var s = sur(D[i]);
      var r = D.slice(i, i + n).filter(function (v) { return sur(v) === s; });
      head(r[0]);
      q.textContent = txt(r);
      shown = r;
      save(r[r.length - 1].verse_key);
      foot();
      nb.style.display = 'inline-block';
    }
    function next() {
      var last = shown[shown.length - 1];
      var i = D.findIndex(function (v) { return v.verse_key === last.verse_key; }) + 1;
      if (i >= D.length) { nb.style.display = 'none'; return; }
      if (sur(D[i]) !== sur(last)) { np = ''; show(i, 10); return; }
      var r = D.slice(i, i + 3).filter(function (v) { return sur(v) === sur(last); });
      q.textContent += ' ' + txt(r);
      shown = shown.concat(r);
      save(r[r.length - 1].verse_key);
      foot();
    }
    nb.onclick = next;

    if (P === '@next') {
      var k = load();
      if (!k) { h.textContent = 'لا أعرف آخر آية معروضة'; return; }
      var j = D.findIndex(function (v) { return v.verse_key === k; });
      shown = [D[j]];
      q.textContent = '';
      h.textContent = '';
      shown = [D[j]];
      var i2 = j + 1;
      if (i2 >= D.length) { h.textContent = 'نهاية المصحف'; return; }
      if (sur(D[i2]) !== sur(D[j])) { show(i2, 10); return; }
      h.style.display = 'none';
      var r2 = D.slice(i2, i2 + 3).filter(function (v) { return sur(v) === sur(D[j]); });
      q.textContent = txt(r2);
      shown = r2;
      save(r2[r2.length - 1].verse_key);
      foot();
      nb.style.display = 'inline-block';
      return;
    }

    np = nm(P);
    var hits = [];
    var eq = [], st = [];
    D.forEach(function (v, i) {
      var t = nm(v.text_uthmani);
      if (t.indexOf(np) >= 0) { hits.push(i); if (t === np) eq.push(i); else if (t.indexOf(np) === 0) st.push(i); }
    });
    if (eq.length || st.length) hits = eq.concat(st);
    if (!hits.length) { h.textContent = 'لم أجد العبارة في المصحف'; f.textContent = 'تحميل الملف: ' + A(tl) + ' ث'; return; }
    if (hits.length === 1) { show(hits[0], 11); return; }
    h.textContent = 'العبارة في أكثر من آية، اختر:';
    hits.slice(0, 12).forEach(function (i) {
      var v = D[i], b = document.createElement('button');
      b.textContent = S[sur(v) - 1] + ' ' + A(v.verse_number) + ': ' + v.text_uthmani.split(' ').slice(0, 6).join(' ');
      b.style.cssText = 'display:block;margin:4px 0;font-size:15px;text-align:right';
      b.onclick = function () { show(i, 11); };
      o.appendChild(b);
    });
  };
})();
