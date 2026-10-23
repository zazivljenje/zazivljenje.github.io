(function () {
  var DAYS = [
    "2026-10-03", "2026-10-04", "2026-10-05", "2026-10-06", "2026-10-07",
    "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11", "2026-10-12",
    "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-17"
  ];
  var WEEKDAY = [
    "sobota", "nedelja", "ponedeljek", "torek", "sreda", "četrtek", "petek",
    "sobota", "nedelja", "ponedeljek", "torek", "sreda", "četrtek", "petek", "sobota"
  ];
  var DAY_NUM = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  var MARCH = 7;
  var MIN = 1440;
  var SPAN = DAYS.length * MIN;
  var EVENT = MARCH * MIN + 9 * 60 + 30;
  var START = 10 * 60;
  var CHAPTERS = [
    ["Vabilo", "Spodbuda vabi v Ljubljano prihodnjo soboto. Organizator odgovarja na vprašanje, ki ga vedno sliši: zakaj govoriti za nerojene, ko pomoč potrebujejo tudi že rojeni otroci."],
    ["Župnija prenese vabilo", "Sveta Evharistija ponovi vabilo in doda povezavo na pohodzazivljenje.si. Tako se beseda širi, še preden obstaja množica: ena stran, ena povezava, ena prošnja."],
    ["Prvi prepir", "Župniji v Gabrovki in Mengšu objavita vabilo, Urša Cankar pa prosi ljudi, naj pridejo. Isti dan odgovor žali drugo stran, Radio Brežice pa naslovi napad na pohod: napovedan je protishod."],
    ["Pride tisk", "Družina se pogovarja s koordinatorko. Radio Ognjišče, Stranka Straža in študentski račun ponovijo uro in trg. Odgovor poimenuje protishod, še preden se zgodi."],
    ["Ura za drugo stran", "Iskra svojim pove, naj bodo isto sobotno jutro na ulici, za pravico do splava. Odkrita Slovenija opiše mašo in pot. Oba dogodka sta zdaj na isti uri."],
    ["Zgodba, nato trg", "Iskreni.net pove Rosino zgodbo in doda uro na Prešernovem trgu. Nova24TV da geslo v naslov: srce bije že 22. dan. Mladi za življenje objavijo fotografijo in po pomoti datum 25. oktober."],
    ["Dan prej postane topel", "Župnije iz Mengša, Unca, Rakka in Škofje Loke rečejo jutri. Zavod ŽIVIM reče dobrodošli. Franciska Kosmač zapiše z velikimi črkami: povej naprej. Večina računov ta dan zveni pozitivno."],
    ["Ulice", "To je vrh. Politiki, Družina, nadškofija in organizator objavljajo s trga in s poti. Stavek, ki potuje, je srčni utrip. Ob njem sta Iskrin protishod in nekaj ostrih odgovorov. Mešanica je še vedno večinoma toplina in poročanje."],
    ["Odmev", "Dnevni seštevek pade. Radio Ognjišče prinese dve pričevanji. Vatican News in branko.grims.eu se ozreta nazaj. Eden od odgovorov trdi, da sta bila shoda predstavljena kot enakovredna, trga pa nista bila."],
    ["Tišina", "Noben obdržan račun ne objavi. Stolpec pade na črto. Skupni zapis ostane, kjer ga je pustil konec tedna. Konica, nato tišina: to je oblika dogodka."],
    ["Pot domov", "Župnija Rakovnik zapiše, da so prišli peš iz župnije in da so jih pričevanja ganila. Polona Naglič znova objavi fotografije. Organizator reče, da je bil pohod poln veselja."],
    ["Hvala", "En glas, organizator, se zahvali množici. Dan je majhen. Seznam tistih, ki so spregovorili, se ne skrči."],
    ["Zgodba z odra", "Organizator deli pripoved Danija Sitarja o odločitvi njegove mame. Mladi za življenje vprašajo, ali se najdete na fotografijah. Odmev je osebno, ne drugi vrh."],
    ["Druga fotografija", "Mladinina fotografija tedna je protishod, v napisu odgovor na pohod. Spor o soboti je zdaj slika."],
    ["Zadnji odgovor", "Izvoz se konča ob 11.24. Edina obdržana objava je odgovor: to ni bil pohod proti splavu, bil je pohod za življenje. Vabilo teden prej, množica novih računov na dan sam, nato dolg rep."]
  ];
  var STOP = new Set("in na se je so da za pa ki ne ni kot po iz do ob pri od ter ali smo ste sem bo bi to ta te ti tu ko ker ce tudi samo zelo lahko pred nad pod med brez cez skozi proti vsi vse vsa tega tem tej teh danes jutri vceraj letos soboto sobota oktobra oktober foto https www kjer nekaj vec ze naj zato prav res tako nam vam jim svoj svoja svoje svoji svojo bil bila bilo bili biti ima imajo imamo bomo boste bodo bom bos si sta torej ampak vendar oziroma dne ura uri uro skupaj predvsem sploh morda mogoce tokrat toliko nekdo nekomu kateri katera katero katerih nekaj http com status twitter facebook instagram tiktok video this that with from they have been your about more will were was are and the for you not but its our their what when who how did does has had his her she him out all can may into than then them some such only over also after before where which while there here just like said says year years time people first new one two".split(" "));

  function fold(value) {
    return String(value).toLowerCase()
      .replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s")
      .replace(/ž/g, "z").replace(/đ/g, "d");
  }
  function oblika(n, ed, dv, mn, rod) {
    var k = Math.abs(n) % 100;
    var d = k % 10;
    if (d === 1 && k !== 11) return ed;
    if (d === 2 && k !== 12) return dv;
    if ((d === 3 || d === 4) && k !== 13 && k !== 14) return mn;
    return rod;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function linkify(text) {
    var safe = esc(String(text).replace(/\s+/g, " ").trim());
    return safe.replace(/https?:\/\/[^\s<]+/g, function (raw) {
      var href = raw.replace(/[.,;:!?)]+$/g, "");
      var tail = raw.slice(href.length);
      return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + href + "</a>" + tail;
    });
  }
  function minuteOf(at) {
    var dayIndex = DAYS.indexOf(String(at).slice(0, 10));
    if (dayIndex < 0) return 0;
    return dayIndex * MIN + (Number(String(at).slice(11, 13)) || 0) * 60 + (Number(String(at).slice(14, 16)) || 0);
  }
  function clock(minute) {
    var within = ((minute % MIN) + MIN) % MIN;
    var hh = String(Math.floor(within / 60)).padStart(2, "0");
    var mm = String(within % 60).padStart(2, "0");
    return hh + "." + mm;
  }
  function hoverLabel(minute) {
    var dayIndex = Math.min(DAYS.length - 1, Math.floor(minute / MIN));
    return WEEKDAY[dayIndex] + ", " + DAY_NUM[dayIndex] + ". oktober, " + clock(minute);
  }
  function toneFrom(pos, neg) {
    if (pos === 0 && neg === 0) return "neutral";
    if (neg === 0) return "positive";
    if (pos === 0) return "negative";
    if (pos >= neg * 2) return "positive";
    if (neg >= pos * 2) return "negative";
    return "neutral";
  }
  function tokensOf(text) {
    var raws = String(text).replace(/https?:\/\/\S+/g, " ").match(/[A-Za-z0-9čćšžđČĆŠŽĐ]+/g) || [];
    return raws.map(function (raw) { return { raw: raw, folded: fold(raw) }; });
  }
  function scoreText(text, lexicon) {
    var tokens = tokensOf(text);
    var used = tokens.map(function () { return false; });
    var ordered = lexicon.slice().sort(function (a, b) { return fold(b.phrase).length - fold(a.phrase).length; });
    var hits = [];
    var weights = { positive: 0, neutral: 0, negative: 0 };
    ordered.forEach(function (item) {
      var phrase = fold(item.phrase);
      if (phrase.length < (item.stem ? 3 : 2)) return;
      var count = 0;
      tokens.forEach(function (token, i) {
        if (used[i]) return;
        var ok = item.stem ? token.folded.indexOf(phrase) === 0 : token.folded === phrase;
        if (!ok) return;
        used[i] = true;
        count += 1;
        hits.push({ word: token.raw, phrase: item.phrase, tone: item.tone });
      });
      if (count > 0) weights[item.tone] += Math.min(count, 3);
    });
    return { pos: weights.positive, neg: weights.negative, tone: toneFrom(weights.positive, weights.negative), hits: hits };
  }
  function toneOfFolded(folded, lexicon) {
    var best = null;
    var bestLen = 0;
    lexicon.forEach(function (item) {
      var phrase = fold(item.phrase);
      if (phrase.length < (item.stem ? 3 : 2)) return;
      var ok = item.stem ? folded.indexOf(phrase) === 0 : folded === phrase;
      if (!ok || phrase.length <= bestLen) return;
      best = item.tone;
      bestLen = phrase.length;
    });
    return best;
  }
  function pairTone(left, right) {
    if (!left && !right) return null;
    if (left === "negative" || right === "negative") {
      if (left === "positive" || right === "positive") return "neutral";
      return "negative";
    }
    if (left === "positive" || right === "positive") return "positive";
    return "neutral";
  }
  function hostsIn(text) {
    var found = String(text).match(/https?:\/\/[^\s)]+/g) || [];
    var hosts = [];
    found.forEach(function (raw) {
      try {
        var host = new URL(raw.replace(/[.,)]+$/, "")).host.replace(/^www\./, "");
        if (host) hosts.push(host);
      } catch (e) { /* skip */ }
    });
    return hosts;
  }
  function clip(text, max) {
    var clean = String(text).replace(/\s+/g, " ").trim();
    return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
  }
  function platformLabel(platform) {
    if (platform === "facebook") return "Facebook";
    if (platform === "instagram") return "Instagram";
    if (platform === "tiktok") return "TikTok";
    if (platform === "x") return "X";
    return platform;
  }
  function toneLabel(tone) {
    if (tone === "positive") return "pozitivno";
    if (tone === "negative") return "negativno";
    return "nevtralno";
  }
  function mark(platform) {
    if (platform === "facebook") {
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><text x="8" y="12.5" text-anchor="middle" font-size="13" font-family="Georgia,serif" font-weight="700" fill="currentColor">f</text></svg>';
    }
    if (platform === "instagram") {
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2.4" y="2.4" width="11.2" height="11.2" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="11.5" cy="4.6" r="0.75" fill="currentColor"/></svg>';
    }
    if (platform === "x") {
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 3.2 L12.8 12.8 M12.8 3.2 L3.2 12.8" stroke="currentColor" stroke-width="1.7"/></svg>';
    }
    return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.2 13.2 a2.1 2.1 0 1 1 0.15-3.4 L6.4 3.4 H11.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function legend() {
    return '<div class="pohod-legend" aria-label="Ton objave">' +
      '<span><i class="pohod-swatch pohod-swatch--pos"></i> Pozitivno</span>' +
      '<span><i class="pohod-swatch pohod-swatch--neu"></i> Nevtralno</span>' +
      '<span><i class="pohod-swatch pohod-swatch--neg"></i> Negativno</span>' +
      "</div>";
  }
  function smoothArea(points, baseline) {
    if (!points.length) return "";
    if (points.length === 1) {
      var p = points[0];
      return "M " + (p.x - 16) + " " + baseline + " Q " + p.x + " " + p.y + " " + (p.x + 16) + " " + baseline + " Z";
    }
    var d = "M " + points[0].x + " " + baseline + " L " + points[0].x + " " + points[0].y;
    for (var i = 0; i < points.length - 1; i++) {
      var current = points[i];
      var next = points[i + 1];
      var mid = (current.x + next.x) / 2;
      d += " C " + mid + " " + current.y + ", " + mid + " " + next.y + ", " + next.x + " " + next.y;
    }
    var last = points[points.length - 1];
    return d + " L " + last.x + " " + baseline + " Z";
  }
  function starSvg() {
    return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.3 L9.7 5.5 L14.2 5.9 L10.7 8.8 L11.8 13.3 L8 10.9 L4.2 13.3 L5.3 8.8 L1.8 5.9 L6.3 5.5 Z" fill="currentColor"/></svg>';
  }
  function controlIcon(kind) {
    if (kind === "pause") {
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.4 H6.3 V13.6 H4 Z M9.7 2.4 H12 V13.6 H9.7 Z" fill="currentColor"/></svg>';
    }
    if (kind === "replay") {
      return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.2 8 a5.2 5.2 0 1 1 -1.6 -3.7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8.6 2.1 H13.2 V6.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    return '<svg class="is-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 2.6 L13.2 8 L5 13.4 Z" fill="currentColor"/></svg>';
  }

  function mount(root, data) {
    if (!data || data.published === false) {
      root.textContent = "Ta vizualizacija še ni objavljena.";
      return;
    }
    var lexicon = Array.isArray(data.lexicon) ? data.lexicon : [];
    var notable = new Set(data.notableVoices || []);
    var highlightIds = new Set(data.highlightIds || []);
    var posts = (data.posts || []).filter(function (post) { return post.relevant !== false; });
    var scored = posts.map(function (post) {
      var result = scoreText(post.text, lexicon);
      return { post: post, pos: result.pos, neg: result.neg, tone: result.tone, hits: result.hits };
    });
    var byId = {};
    scored.forEach(function (item) { byId[item.post.id] = item; });
    var playhead = START;
    var playing = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var timer = 0;
    var arrived = {};
    var dragging = false;

    root.innerHTML =
      '<div class="pohod-controls">' +
        '<button type="button" class="pohod-play" aria-label="Premor">' + controlIcon("pause") + "</button>" +
        '<div class="pohod-slider">' +
          '<div class="pohod-rail" tabindex="0" role="slider" aria-label="Čas od 3. do 17. oktobra 2026" aria-valuemin="0" aria-valuemax="' + (SPAN - 1) + '">' +
            '<div class="pohod-rail-track"></div>' +
            '<div class="pohod-rail-fill"></div>' +
            '<svg class="pohod-ticks" viewBox="0 0 3600 14" preserveAspectRatio="none" aria-hidden="true"></svg>' +
            '<button type="button" class="pohod-star" aria-label="Sobota, 10. oktober, 9.30, Prešernov trg">' + starSvg() + "</button>" +
            '<div class="pohod-thumb"></div>' +
            '<div class="pohod-tip" hidden></div>' +
          "</div>" +
          '<div class="pohod-days"></div>' +
        "</div>" +
      "</div>" +
      '<section class="pohod-panel">' +
        '<div class="pohod-plot-head"><h2>Kako se je širil glas o Pohodu?</h2>' + legend() + "</div>" +
        '<div class="pohod-plot"></div>' +
      "</section>" +
      '<section class="pohod-block">' +
        '<div class="pohod-crowd-head">' +
          "<h2>Kje so se oglasili?</h2>" +
          '<details class="pohod-help"><summary>Kako brati kroge</summary>' +
          '<p class="pohod-note"><strong>Svetel krog</strong> predstavlja novo objavo, <strong>temnejši krog</strong> označuje že objavljeno vsebino, <strong>temno moder krog</strong> pa pomeni, da do objave še ni prišlo. Rob kroga prikazuje trajanje in pomembnost objave – <strong>tanka obroba</strong> nakazuje prvi dan objave, <strong>debelejša obroba</strong> pa označuje izpostavljeno objavo. Oznaka znotraj kroga pove, na kateri platformi je bila vsebina objavljena.</p>' +
          "</details>" +
        "</div>" +
        '<div class="pohod-crowd"></div>' +
      "</section>" +
      '<div class="pohod-split">' +
        '<section class="pohod-pane pohod-cloud-pane">' +
          "<h2>Pogosti izrazi</h2>" +
          '<div class="pohod-cloud-wrap"><div class="pohod-cloud"></div></div>' +
        "</section>" +
        '<section class="pohod-pane pohod-responses-pane">' +
          "<h2>Nekateri odzivi iz družbenih omrežij</h2>" +
          '<div class="pohod-responses"><div class="pohod-cards"></div></div>' +
        "</section>" +
      "</div>";

    var playBtn = root.querySelector(".pohod-play");
    var rail = root.querySelector(".pohod-rail");
    var fill = root.querySelector(".pohod-rail-fill");
    var thumb = root.querySelector(".pohod-thumb");
    var star = root.querySelector(".pohod-star");
    var tip = root.querySelector(".pohod-tip");
    var ticks = root.querySelector(".pohod-ticks");
    var daysEl = root.querySelector(".pohod-days");
    var cardsEl = root.querySelector(".pohod-cards");
    var crowd = root.querySelector(".pohod-crowd");
    var plot = root.querySelector(".pohod-plot");
    var cloudEl = root.querySelector(".pohod-cloud");

    var tickMarkup = "";
    for (var hour = 0; hour <= DAYS.length * 24; hour++) {
      var x = (hour / (DAYS.length * 24)) * 3600;
      var tall = hour % 24 === 0;
      tickMarkup += '<line x1="' + x + '" x2="' + x + '" y1="' + (tall ? 1 : 5) + '" y2="13" stroke="currentColor" stroke-width="' + (tall ? 1.6 : 1) + '"/>';
    }
    ticks.innerHTML = tickMarkup;
    star.style.left = (EVENT / (SPAN - 1) * 100) + "%";

    DAY_NUM.forEach(function (num, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pohod-day" + (index === MARCH ? " is-event" : "");
      btn.dataset.index = String(index);
      btn.textContent = String(num);
      btn.addEventListener("click", function () {
        pause();
        setPlayhead(index === MARCH ? EVENT : Math.min(SPAN - 1, (index + 1) * MIN - 60));
      });
      daysEl.appendChild(btn);
    });

    function throughAt(minute) {
      return scored.filter(function (item) { return minuteOf(item.post.at) <= minute; });
    }

    function frame(minute) {
      var dayIndex = Math.min(DAYS.length - 1, Math.floor(minute / MIN));
      var throughDay = DAYS[dayIndex];
      var through = throughAt(minute);
      var dayPosts = through.filter(function (item) { return item.post.day === throughDay; });
      var firstSeen = {};
      scored.forEach(function (item) {
        if (item.post.day < throughDay) firstSeen[item.post.voice] = true;
      });
      var first = {};
      var weights = {};
      var spoke = {};
      through.forEach(function (item) {
        var prev = first[item.post.voice];
        if (!prev || item.post.at < prev.at) {
          first[item.post.voice] = {
            day: item.post.day,
            minute: minuteOf(item.post.at) % MIN,
            platform: item.post.platform,
            at: item.post.at
          };
        }
        var current = weights[item.post.voice] || { pos: 0, neg: 0 };
        current.pos += item.pos;
        current.neg += item.neg;
        weights[item.post.voice] = current;
        if (item.post.day === throughDay) spoke[item.post.voice] = true;
      });
      var roster = Object.keys(first).map(function (voice) {
        var meta = first[voice];
        var current = weights[voice] || { pos: 0, neg: 0 };
        return {
          voice: voice,
          day: meta.day,
          minute: meta.minute,
          platform: meta.platform,
          tone: toneFrom(current.pos, current.neg),
          speaking: !!spoke[voice],
          isNew: meta.day === throughDay
        };
      }).sort(function (a, b) {
        return a.day < b.day ? -1 : a.day > b.day ? 1 : a.minute - b.minute;
      });
      var todayVoices = {};
      dayPosts.forEach(function (item) { todayVoices[item.post.voice] = true; });
      var todayCount = Object.keys(todayVoices).length;
      var minuteInDay = minute % MIN;
      var prevCount = 0;
      if (dayIndex > 0) {
        var prevVoices = {};
        scored.forEach(function (item) {
          if (item.post.day === DAYS[dayIndex - 1] && minuteOf(item.post.at) % MIN <= minuteInDay) {
            prevVoices[item.post.voice] = true;
          }
        });
        prevCount = Object.keys(prevVoices).length;
      }
      var newToday = {};
      dayPosts.forEach(function (item) {
        if (!firstSeen[item.post.voice]) newToday[item.post.voice] = true;
      });
      var accountTones = { positive: 0, neutral: 0, negative: 0 };
      Object.keys(weights).forEach(function (voice) {
        var w = weights[voice];
        accountTones[toneFrom(w.pos, w.neg)] += 1;
      });
      var picked = [];
      if (dayIndex >= MARCH) {
        var highlights = dayPosts.filter(function (item) {
          return item.tone === "positive" && (highlightIds.has(item.post.id) || (!highlightIds.size && notable.has(item.post.voice)));
        });
        var best = {};
        highlights.forEach(function (item) {
          var prev = best[item.post.voice];
          if (!prev || item.pos > prev.pos || (item.pos === prev.pos && item.post.at < prev.post.at)) best[item.post.voice] = item;
        });
        picked = Object.keys(best).map(function (voice) { return best[voice]; })
          .sort(function (a, b) { return b.pos - a.pos || (a.post.at < b.post.at ? -1 : 1); })
          .slice(0, 3);
        if (highlightIds.size) {
          picked = dayPosts.filter(function (item) {
            return highlightIds.has(item.post.id) && item.tone === "positive";
          }).sort(function (a, b) { return a.post.at < b.post.at ? -1 : 1; }).slice(0, 3);
        }
      }
      return {
        dayIndex: dayIndex,
        throughDay: throughDay,
        through: through,
        dayPosts: dayPosts,
        roster: roster,
        todayCount: todayCount,
        delta: todayCount - prevCount,
        newCount: Object.keys(newToday).length,
        accounts: Object.keys(weights).length,
        accountTones: accountTones,
        highlights: picked,
        highlightVoices: picked.reduce(function (set, item) { set[item.post.voice] = true; return set; }, {})
      };
    }

    var CLOUD_PHRASES = [
      ["pohod za zivljenje", "pohod za življenje", "neutral"],
      ["presernovem trgu", "Prešernov trg", "neutral"],
      ["presernov trg", "Prešernov trg", "neutral"],
      ["srce bije", "srce bije", "neutral"],
      ["srcni utrip", "srčni utrip", "neutral"],
      ["nerojenih otrok", "nerojeni otroci", "neutral"],
      ["nerojene otroke", "nerojeni otroci", "neutral"],
      ["nerojenega otroka", "nerojeni otroci", "neutral"],
      ["cloveskega zivljenja", "človeško življenje", "neutral"],
      ["clovesko zivljenje", "človeško življenje", "neutral"],
      ["sveto maso", "sveta maša", "neutral"],
      ["sveta masa", "sveta maša", "neutral"],
      ["od spocetja", "od spočetja", "neutral"],
      ["ljubljanskih ulicah", "ljubljanske ulice", "neutral"],
      ["ljubljanske ulice", "ljubljanske ulice", "neutral"],
      ["otrok je dar", "otrok je dar", "positive"],
      ["pravica do zivljenja", "pravica do življenja", "neutral"],
      ["pravico do zivljenja", "pravica do življenja", "neutral"],
      ["mame v stiski", "mame v stiski", "neutral"],
      ["mamam v stiski", "mame v stiski", "neutral"],
      ["veselje do zivljenja", "veselje do življenja", "positive"],
      ["veselja do zivljenja", "veselje do življenja", "positive"],
      ["druzin", "družina", "neutral"],
      ["splav", "splav", "neutral"],
      ["hvala", "hvala", "positive"],
      ["hvalez", "hvala", "positive"],
      ["vabljen", "vabljeni", "positive"],
      ["veselj", "veselje", "positive"],
      ["pricevanj", "pričevanje", "neutral"],
      ["spostovan", "spoštovanje", "positive"],
      ["mnozic", "množica", "neutral"],
      ["ljubezn", "ljubezen", "positive"],
      ["pridite", "pridite", "neutral"],
      ["pomoc", "pomoč", "neutral"],
      ["dostojn", "dostojanstvo", "neutral"],
      ["upanj", "upanje", "positive"],
      ["radost", "radost", "positive"],
      ["socutj", "sočutje", "positive"],
      ["blagoslov", "blagoslov", "positive"]
    ];
    var slotOrder = [];
    var seenSlot = {};
    scored.slice().sort(function (a, b) { return a.post.at < b.post.at ? -1 : 1; }).forEach(function (item) {
      if (seenSlot[item.post.voice]) return;
      seenSlot[item.post.voice] = true;
      slotOrder.push(item.post.voice);
    });
    while (slotOrder.length < 15 * 4) slotOrder.push("");

    function fitCrowd() {
      var width = crowd.clientWidth || root.clientWidth;
      if (!width) return;
      var dot = width < 560 ? 20 : 23;
      var gap = width < 560 ? 5 : 7;
      var usable = Math.max(dot, width - 8);
      var cols = Math.min(15, Math.max(1, Math.floor((usable + gap) / (dot + gap))));
      var rows = Math.ceil(slotOrder.length / cols);
      crowd.style.setProperty("--pohod-cols", String(cols));
      crowd.style.setProperty("--pohod-rows", String(rows));
      crowd.style.setProperty("--pohod-dot", dot + "px");
      crowd.style.setProperty("--pohod-gap", gap + "px");
    }
    fitCrowd();
    if (window.ResizeObserver) new ResizeObserver(fitCrowd).observe(crowd);

    function cloudOf(through) {
      var counts = {};
      through.forEach(function (item) {
        var flat = fold(String(item.post.text).replace(/https?:\/\/\S+/g, " ").replace(/[_#]+/g, " "));
        var seen = {};
        CLOUD_PHRASES.forEach(function (entry) {
          if (flat.indexOf(entry[0]) < 0 || seen[entry[1]]) return;
          seen[entry[1]] = true;
          if (counts[entry[1]]) counts[entry[1]].n += 1;
          else counts[entry[1]] = { key: entry[1], label: entry[1], n: 1, tone: entry[2] };
        });
      });
      return Object.keys(counts).map(function (key) { return counts[key]; })
        .sort(function (a, b) { return b.n - a.n || (a.label < b.label ? -1 : 1); })
        .slice(0, 18);
    }

    function wordWidth(label, size) {
      var probe = wordWidth.probe;
      if (!probe) {
        probe = document.createElement("div");
        probe.style.position = "absolute";
        probe.style.left = "-9999px";
        probe.style.top = "0";
        probe.style.visibility = "hidden";
        probe.style.whiteSpace = "nowrap";
        probe.style.fontWeight = "650";
        probe.style.pointerEvents = "none";
        cloudEl.appendChild(probe);
        wordWidth.probe = probe;
      }
      probe.style.fontSize = size + "px";
      probe.textContent = label;
      var box = probe.getBoundingClientRect();
      return { w: box.width, h: box.height };
    }

    function arrangeCloud(cloud) {
      var boxW = cloudEl.clientWidth || 280;
      var boxH = cloudEl.clientHeight || 220;
      var placed = [];
      var maxN = cloud.reduce(function (max, item) { return Math.max(max, item.n); }, 1);
      var gapX = boxW < 420 ? 6 : 12;
      var gapY = boxW < 420 ? 4 : 8;
      cloud.forEach(function (item) {
        item.size = Math.round(13 + Math.sqrt(item.n / maxN) * (boxW < 420 ? 11 : 18));
        var measured = wordWidth(item.label, item.size);
        item.w = measured.w;
        item.h = measured.h;
      });
      var widest = cloud.reduce(function (max, item) { return Math.max(max, item.w); }, 1);
      var fit = boxW * 0.94;
      if (widest > fit) {
        var scale = fit / widest;
        cloud.forEach(function (item) {
          item.size = Math.max(12, Math.round(item.size * scale));
          var measured = wordWidth(item.label, item.size);
          item.w = measured.w;
          item.h = measured.h;
        });
      }
      function free(x, y, w, h) {
        if (x < 0 || y < 0 || x + w > boxW || y + h > boxH) return false;
        return !placed.some(function (prev) {
          return x < prev.x + prev.w + gapX && x + w + gapX > prev.x && y < prev.y + prev.h + gapY && y + h + gapY > prev.y;
        });
      }
      cloud.forEach(function (item, index) {
        var w = item.w;
        var h = item.h;
        var cx = (boxW - w) / 2;
        var cy = (boxH - h) / 2;
        var spot = index === 0 && free(cx, cy, w, h) ? { x: cx, y: cy } : null;
        for (var step = 0; step < 640 && !spot; step++) {
          var rad = 6 + step * 1.35;
          var ang = step * 0.7;
          var x = cx + Math.cos(ang) * rad;
          var y = cy + Math.sin(ang) * rad * 0.72;
          if (free(x, y, w, h)) spot = { x: x, y: y };
        }
        for (var gy = 0; gy <= boxH - h && !spot; gy += 4) {
          for (var gx = 0; gx <= boxW - w && !spot; gx += 4) {
            if (free(gx, gy, w, h)) spot = { x: gx, y: gy };
          }
        }
        if (!spot) {
          item.hide = true;
          return;
        }
        item.hide = false;
        placed.push({ x: spot.x, y: spot.y, w: w, h: h });
        item.x = spot.x / boxW;
        item.y = spot.y / boxH;
        item.rot = 0;
        if (boxW >= 420 && index > 1 && w < boxW * 0.34) {
          var spin = 0;
          for (var i = 0; i < item.key.length; i++) spin += item.key.charCodeAt(i) * (i + 1);
          item.rot = (spin % 5) - 2;
        }
      });
    }

    function whenLabel(at) {
      var dayIndex = DAYS.indexOf(String(at).slice(0, 10));
      var hhmm = String(at).slice(11, 16).replace(":", ".");
      if (dayIndex < 0) return hhmm;
      return DAY_NUM[dayIndex] + ". oktober, " + hhmm;
    }

    function paintCloud(cloud) {
      var wrap = root.querySelector(".pohod-cloud-pane");
      wrap.hidden = cloud.length === 0;
      arrangeCloud(cloud);
      var keep = {};
      var before = {};
      Array.prototype.forEach.call(cloudEl.children, function (span) {
        before[span.dataset.key] = span.getBoundingClientRect();
      });
      cloud.forEach(function (item) {
        if (item.hide || typeof item.x !== "number") return;
        keep[item.key] = true;
        var span = cloudEl.querySelector('[data-key="' + item.key.replace(/"/g, "") + '"]');
        var fresh = !span;
        if (!span) {
          span = document.createElement("span");
          span.dataset.key = item.key;
          span.textContent = item.label;
          cloudEl.appendChild(span);
        }
        span.className = "tone-" + item.tone + (fresh ? " is-new" : "");
        span.style.fontSize = item.size + "px";
        span.style.left = (item.x * 100) + "%";
        span.style.top = (item.y * 100) + "%";
        span.style.setProperty("--pohod-rot", item.rot + "deg");
      });
      Array.prototype.slice.call(cloudEl.querySelectorAll("span")).forEach(function (span) {
        if (!keep[span.dataset.key]) span.remove();
      });
      cloud.forEach(function (item) {
        var span = cloudEl.querySelector('[data-key="' + item.key.replace(/"/g, "") + '"]');
        if (span) cloudEl.appendChild(span);
      });
      cloud.forEach(function (item) {
        var span = cloudEl.querySelector('[data-key="' + item.key.replace(/"/g, "") + '"]');
        var prev = span && before[item.key];
        if (!span || !prev || !prev.width) return;
        var next = span.getBoundingClientRect();
        var dx = prev.left - next.left;
        var dy = prev.top - next.top;
        var rest = "rotate(var(--pohod-rot))";
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
          span.style.transform = rest;
          return;
        }
        span.style.transition = "none";
        span.style.transform = "translate(" + dx + "px," + dy + "px) " + rest;
        window.requestAnimationFrame(function () {
          span.style.transition = "";
          span.style.transform = rest;
        });
      });
    }

    function cardQueue(minute) {
      var eligible = scored.filter(function (item) {
        var at = minuteOf(item.post.at);
        if (at > minute || at < MARCH * MIN) return false;
        if (item.tone !== "positive") return false;
        if (highlightIds.size) return highlightIds.has(item.post.id);
        return notable.has(item.post.voice);
      }).sort(function (a, b) { return minuteOf(a.post.at) - minuteOf(b.post.at); });
      var slots = [null, null, null];
      eligible.forEach(function (item, index) {
        slots[index % 3] = item;
      });
      return slots;
    }

    function cardMarkup(item) {
      var post = item.post;
      var label = platformLabel(post.platform);
      var href = post.url
        ? '<a class="pohod-card__open" href="' + esc(post.url) + '" target="_blank" rel="noopener noreferrer" aria-label="Odpri na ' + esc(label) + '"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.2 H3.4 V12.6 H12.8 V10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M8.2 3.2 H12.8 V7.8 M12.6 3.4 L7.2 8.8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
        : "";
      return href +
        "<header>" +
          '<span class="pohod-card__mark platform-' + esc(post.platform) + '" title="' + esc(label) + '">' + mark(post.platform) + "</span>" +
          "<div><strong>" + esc(post.voice) + "</strong><time>" + esc(whenLabel(post.at)) + "</time></div>" +
        "</header>" +
        "<p>" + linkify(post.text) + "</p>";
    }

    function borderMix(item, minute, rank) {
      var ageHours = Math.max(0, minute - minuteOf(item.post.at)) / 60;
      var decay = Math.exp(-ageHours / 36);
      var weight = rank === 0 ? 1 : rank === 1 ? 0.7 : 0.45;
      return Math.max(22, Math.min(100, Math.round(decay * weight * 100)));
    }

    function paintCards(minute) {
      var queue = cardQueue(minute);
      var cards = cardsEl.querySelectorAll(".pohod-card");
      if (cards.length !== 3) {
        cardsEl.innerHTML = '<article class="pohod-card is-empty" aria-hidden="true"></article><article class="pohod-card is-empty" aria-hidden="true"></article><article class="pohod-card is-empty" aria-hidden="true"></article>';
        cards = cardsEl.querySelectorAll(".pohod-card");
      }
      var ranked = queue.filter(Boolean).slice().sort(function (a, b) {
        return minuteOf(b.post.at) - minuteOf(a.post.at);
      });
      queue.forEach(function (item, index) {
        var card = cards[index];
        var id = item ? item.post.id : "";
        if (card.dataset.id !== id) {
          card.dataset.id = id;
          if (!item) {
            card.className = "pohod-card is-empty";
            card.innerHTML = "";
            card.setAttribute("aria-hidden", "true");
            card.style.borderColor = "";
          } else {
            card.className = "pohod-card";
            card.removeAttribute("aria-hidden");
            card.innerHTML = cardMarkup(item);
            void card.offsetWidth;
            card.classList.add("is-swap");
          }
        }
        if (!item) return;
        var rank = 0;
        ranked.forEach(function (other, order) {
          if (other.post.id === item.post.id) rank = order;
        });
        card.style.borderColor = "color-mix(in srgb, var(--pohod-accent) " + borderMix(item, minute, rank) + "%, transparent)";
      });
      return queue;
    }

    function render() {
      var state = frame(playhead);
      var ratio = playhead / (SPAN - 1);
      fill.style.width = (ratio * 100) + "%";
      thumb.style.left = (ratio * 100) + "%";
      rail.setAttribute("aria-valuenow", String(playhead));
      rail.setAttribute("aria-valuetext", hoverLabel(playhead));
      var control = playhead >= SPAN - 120 && !playing ? "replay" : (playing ? "pause" : "play");
      var controlLabel = control === "pause" ? "Premor" : (control === "replay" ? "Predvajaj znova" : "Predvajaj");
      if (playBtn.dataset.state !== control) {
        playBtn.dataset.state = control;
        playBtn.innerHTML = controlIcon(control);
        playBtn.setAttribute("aria-label", controlLabel);
      }
      daysEl.querySelectorAll(".pohod-day").forEach(function (btn) {
        btn.classList.toggle("is-now", Number(btn.dataset.index) === state.dayIndex);
      });

      var queue = paintCards(playhead);
      var shown = {};
      queue.forEach(function (item) {
        if (item) shown[item.post.voice] = true;
      });

      var byVoice = {};
      state.roster.forEach(function (person) { byVoice[person.voice] = person; });
      crowd.innerHTML = slotOrder.map(function (voice) {
        var person = byVoice[voice];
        if (!voice || !person) return '<span class="pohod-dot is-empty"></span>';
        var notableNow = !!shown[person.voice];
        var klass = "pohod-dot tone-" + person.tone + (person.speaking ? " is-speaking" : " is-dim") + (notableNow ? " is-notable" : "") + (person.isNew ? " is-first" : "");
        if (!arrived[person.voice]) {
          arrived[person.voice] = true;
          klass += " is-arrive";
        }
        return '<span class="' + klass + '">' + mark(person.platform) + "</span>";
      }).join("");

      plot.innerHTML = plotSvg(state);
      paintCloud(cloudOf(state.through));
    }

    function plotSvg(state) {
      var plotW = 900;
      var left = 8;
      var right = 8;
      var top = 8;
      var bottom = 18;
      var innerW = plotW - left - right;
      var colW = innerW / DAYS.length;
      function xOf(index) { return left + (index + 0.5) * colW; }
      var bands = DAYS.map(function (day) {
        var posts = state.through.filter(function (item) { return item.post.day === day; });
        function take(tone) {
          return posts.filter(function (item) { return item.tone === tone; }).sort(function (a, b) { return a.post.at < b.post.at ? -1 : 1; });
        }
        return { positive: take("positive"), negative: take("negative"), neutral: take("neutral") };
      });
      var revealed = bands.slice(0, state.dayIndex + 1);
      var maxPos = 1;
      var maxNeg = 1;
      var dayPos = {};
      var dayNeg = {};
      scored.forEach(function (item) {
        var day = item.post.day;
        if (item.tone === "positive") dayPos[day] = (dayPos[day] || 0) + 1;
        if (item.tone === "negative") dayNeg[day] = (dayNeg[day] || 0) + 1;
      });
      DAYS.forEach(function (day) {
        maxPos = Math.max(maxPos, dayPos[day] || 0);
        maxNeg = Math.max(maxNeg, dayNeg[day] || 0);
      });
      var pitch = 7.2;
      var radius = 3.05;
      var negRoom = Math.max(16, maxNeg * pitch + 8);
      var posRoom = Math.max(22, maxPos * pitch + 6);
      var plotH = top + posRoom + negRoom + bottom;
      var cy = top + posRoom;
      var posPts = revealed.map(function (band, index) { return { x: xOf(index), y: cy - band.positive.length * pitch }; });
      var negPts = revealed.map(function (band, index) { return { x: xOf(index), y: cy + band.negative.length * pitch }; });
      var dots = "";
      bands.forEach(function (band, index) {
        if (index > state.dayIndex) return;
        var step = Math.min(5, (colW * 0.7) / Math.max(1, band.neutral.length));
        band.positive.forEach(function (person, order) {
          dots += '<circle cx="' + xOf(index) + '" cy="' + (cy - (order + 0.55) * pitch) + '" r="' + radius + '" class="tone-positive"></circle>';
        });
        band.negative.forEach(function (person, order) {
          dots += '<circle cx="' + xOf(index) + '" cy="' + (cy + (order + 0.55) * pitch) + '" r="' + radius + '" class="tone-negative"></circle>';
        });
        band.neutral.forEach(function (person, order) {
          var cx = xOf(index) + (order - (band.neutral.length - 1) / 2) * step;
          dots += '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" class="tone-neutral"></circle>';
        });
      });
      var labels = DAYS.map(function (day, index) {
        return '<text x="' + xOf(index) + '" y="' + (plotH - 8) + '" text-anchor="middle" class="' + (index === MARCH ? "is-event" : "") + '">' + DAY_NUM[index] + "</text>";
      }).join("");
      return '<svg viewBox="0 0 ' + plotW + " " + plotH + '" role="img" aria-label="Objave po dnevih. Vsaka pika je ena objava: pozitivne nad sredinsko črto, negativne pod njo, nevtralne na črti.">' +
        '<path class="pohod-area pohod-area--pos" d="' + smoothArea(posPts, cy) + '"/>' +
        '<path class="pohod-area pohod-area--neg" d="' + smoothArea(negPts, cy) + '"/>' +
        '<line x1="' + left + '" x2="' + (plotW - right) + '" y1="' + cy + '" y2="' + cy + '" class="pohod-baseline"/>' +
        dots +
        labels +
        "</svg>";
    }

    function setPlayhead(minute) {
      playhead = Math.max(0, Math.min(SPAN - 1, minute));
      render();
    }
    function pause() {
      playing = false;
      if (timer) window.clearInterval(timer);
      timer = 0;
      render();
    }
    function play() {
      if (playhead >= SPAN - 120) playhead = START;
      playing = true;
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        if (playhead >= SPAN - 1) {
          pause();
          return;
        }
        playhead = Math.min(SPAN - 1, playhead + 60);
        render();
      }, 180);
      render();
    }
    function minuteFromX(clientX) {
      var rect = rail.getBoundingClientRect();
      var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return Math.min(SPAN - 1, Math.round((ratio * (SPAN - 1)) / 60) * 60);
    }
    function showTip(clientX, text) {
      var rect = rail.getBoundingClientRect();
      var x = Math.min(rect.width - 8, Math.max(8, clientX - rect.left));
      tip.hidden = false;
      tip.textContent = text;
      tip.style.left = x + "px";
    }

    playBtn.addEventListener("click", function () {
      if (playing) pause();
      else play();
    });
    star.addEventListener("click", function (event) {
      event.stopPropagation();
      pause();
      setPlayhead(EVENT);
    });
    rail.addEventListener("pointerdown", function (event) {
      if (event.target.closest(".pohod-star")) return;
      dragging = true;
      pause();
      if (rail.setPointerCapture) rail.setPointerCapture(event.pointerId);
      setPlayhead(minuteFromX(event.clientX));
      showTip(event.clientX, hoverLabel(playhead));
    });
    rail.addEventListener("pointermove", function (event) {
      if (event.target.closest && event.target.closest(".pohod-star") && !dragging) {
        showTip(event.clientX, "sobota, 10. oktober, 9.30");
        return;
      }
      var minute = dragging ? minuteFromX(event.clientX) : minuteFromX(event.clientX);
      if (dragging) setPlayhead(minute);
      showTip(event.clientX, hoverLabel(minute));
    });
    rail.addEventListener("pointerup", function () { dragging = false; });
    rail.addEventListener("pointerleave", function () {
      dragging = false;
      tip.hidden = true;
    });
    rail.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      pause();
      setPlayhead(playhead + (event.key === "ArrowRight" ? 60 : -60));
    });

    render();
    if (playing) play();
  }

  function boot(root) {
    if (root.getAttribute("data-ready") === "1") return;
    root.setAttribute("data-ready", "1");
    var src = root.getAttribute("data-src");
    if (!src) {
      root.textContent = "Vizualizaciji manjkajo podatki.";
      return;
    }
    fetch(src).then(function (res) {
      if (!res.ok) throw new Error("fetch");
      return res.json();
    }).then(function (data) {
      mount(root, data);
    }).catch(function () {
      root.textContent = "Vizualizacije trenutno ni mogoče naložiti.";
    });
  }

  function start() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-pohod-sentiment]"), boot);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
