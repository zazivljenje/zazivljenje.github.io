(function (root) {
  "use strict";

  function money(n) {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  }

  function formatEUR(n) {
    return new Intl.NumberFormat("sl-SI", {
      style: "currency",
      currency: "EUR",
    }).format(n);
  }

  function childBand(i) {
    return i <= 0 ? 0 : i === 1 ? 1 : 2;
  }

  function incomeClass(incomePer, data) {
    const per = money(incomePer);
    if (per > data.otroski_dodatek.dohodek_max) return null;
    for (let i = 0; i < data.otroski_dodatek.razredi.length; i++) {
      const row = data.otroski_dodatek.razredi[i];
      if (per <= row.do) return row;
    }
    return null;
  }

  function vrtecClass(incomePer, data) {
    const per = money(incomePer);
    const rows = data.otroski_dodatek.razredi;
    if (per >= data.vrtec.razred_9_od) {
      return { razred: 9, delez: data.vrtec.delez[8] };
    }
    for (let i = 0; i < rows.length; i++) {
      if (per <= rows[i].do) {
        return { razred: rows[i].razred, delez: data.vrtec.delez[i] };
      }
    }
    return { razred: 9, delez: data.vrtec.delez[8] };
  }

  function calculate(input, data) {
    const parents = input.parents === 1 ? 1 : 2;
    const singleParent = parents === 1 && !!input.singleParent;
    const expecting = !!input.expecting;
    const insured = !!input.insured;
    const net = Math.max(0, Number(input.net) || 0);
    const bruto = Math.max(0, Number(input.bruto) || 0);
    const vrtecPrice = Math.max(0, Number(input.vrtecPrice) || 0);
    const recentBirth = !!input.recentBirth || expecting;

    const children = (input.children || []).map(function (c) {
      return {
        school: c.school === "ss" ? "ss" : c.school === "os" ? "os" : "predsolski",
        vrtec: !!c.vrtec,
      };
    });

    const nChildren = children.length;
    const members = parents + nChildren;
    const incomePer = members > 0 ? money(net / members) : 0;
    const odRow = incomeClass(incomePer, data);

    const odChildren = [];
    let odMonthly = 0;
    if (odRow && nChildren) {
      children.forEach(function (child, i) {
        const table = child.school === "ss" ? odRow.ss : odRow.os;
        let amount = table[childBand(i)];
        const notes = [];
        if (singleParent) {
          amount *= 1 + data.otroski_dodatek.dodatek_enostarsevska;
          notes.push("+30 % enostarševska družina");
        }
        if (child.school === "predsolski" && !child.vrtec) {
          amount *= 1 + data.otroski_dodatek.dodatek_predsolski_brez_vrtca;
          notes.push("+20 % predšolski, ni v vrtcu");
        }
        amount = money(amount);
        odMonthly = money(odMonthly + amount);
        odChildren.push({
          index: i + 1,
          school: child.school,
          amount: amount,
          notes: notes,
        });
      });
    }

    const vrtecIncomePer = members > 0 ? money((net + odMonthly) / members) : 0;
    const vrtecRow = vrtecClass(vrtecIncomePer, data);
    const inVrtecIdx = [];
    children.forEach(function (child, i) {
      if (child.vrtec) inVrtecIdx.push(i);
    });
    const oldestInVrtec = inVrtecIdx.length ? Math.min.apply(null, inVrtecIdx) : -1;

    const vrtecChildren = [];
    let vrtecMonthly = 0;
    children.forEach(function (child, i) {
      if (!child.vrtec) return;
      let free = false;
      let reason = "";
      if (i >= 2) {
        free = true;
        reason = "Tretji in vsak naslednji otrok je oproščen plačila.";
      } else if (inVrtecIdx.length >= 2 && i !== oldestInVrtec) {
        free = true;
        reason = "Ob dveh otrocih v vrtcu je mlajši oproščen plačila.";
      }
      const delez = free ? 0 : vrtecRow.delez;
      const amount = money((delez / 100) * vrtecPrice);
      vrtecMonthly = money(vrtecMonthly + amount);
      vrtecChildren.push({
        index: i + 1,
        free: free,
        reason: reason,
        delez: delez,
        amount: amount,
      });
    });

    let velika = 0;
    if (nChildren >= 4) velika = data.dodatek_za_veliko_druzino.stiri_plus;
    else if (nChildren >= 3) velika = data.dodatek_za_veliko_druzino.tri;

    const pomoc = recentBirth ? data.pomoc_ob_rojstvu.znesek : 0;
    const starsevski = recentBirth && !insured ? data.starsevski_dodatek.znesek : 0;
    const nadomestilo = recentBirth && insured ? money(bruto * data.starsevsko_nadomestilo.delez) : 0;

    const yearBenefits =
      money(odMonthly * 12) +
      pomoc +
      money(starsevski * 12) +
      velika;

    return {
      members: members,
      nChildren: nChildren,
      incomePer: incomePer,
      odRow: odRow,
      odMonthly: odMonthly,
      odYear: money(odMonthly * 12),
      odChildren: odChildren,
      vrtecIncomePer: vrtecIncomePer,
      vrtecRow: vrtecRow,
      vrtecMonthly: vrtecMonthly,
      vrtecChildren: vrtecChildren,
      vrtecPrice: vrtecPrice,
      velika: velika,
      pomoc: pomoc,
      starsevski: starsevski,
      nadomestilo: nadomestilo,
      insured: insured,
      recentBirth: recentBirth,
      expecting: expecting,
      yearBenefits: yearBenefits,
      eligibleOd: !!odRow && nChildren > 0,
    };
  }

  function assertEqual(name, got, want, failures) {
    if (got !== want) failures.push(name + ": got " + got + ", want " + want);
  }

  function runTests(data) {
    const failures = [];
    const t = function (name, input, checks) {
      const out = calculate(input, data);
      checks(out, name);
    };

    t("gov.si 7. razred, 1 otrok", {
      parents: 2,
      net: 3300.6,
      children: [{ school: "os", vrtec: false }],
    }, function (out, name) {
      assertEqual(name + " razred", out.odRow && out.odRow.razred, 7, failures);
      assertEqual(name + " OD", out.odMonthly, 29.52, failures);
      assertEqual(name + " per", out.incomePer, 1100.2, failures);
    });

    t("gov.si 8. razred, 1 otrok", {
      parents: 2,
      net: 3300.63,
      children: [{ school: "os", vrtec: false }],
    }, function (out, name) {
      assertEqual(name + " razred", out.odRow && out.odRow.razred, 8, failures);
      assertEqual(name + " OD", out.odMonthly, 25.7, failures);
    });

    t("gov.si 7. razred, 2 otroka", {
      parents: 2,
      net: 4400.8,
      children: [
        { school: "os", vrtec: false },
        { school: "os", vrtec: false },
      ],
    }, function (out, name) {
      assertEqual(name + " razred", out.odRow && out.odRow.razred, 7, failures);
      assertEqual(name + " OD", out.odMonthly, 68.84, failures);
    });

    t("gov.si 8. razred, 2 otroka", {
      parents: 2,
      net: 5313.12,
      children: [
        { school: "os", vrtec: false },
        { school: "os", vrtec: false },
      ],
    }, function (out, name) {
      assertEqual(name + " razred", out.odRow && out.odRow.razred, 8, failures);
      assertEqual(name + " OD", out.odMonthly, 61.23, failures);
    });

    t("1. razred", {
      parents: 2,
      net: 700,
      children: [{ school: "os", vrtec: false }],
    }, function (out, name) {
      assertEqual(name + " razred", out.odRow && out.odRow.razred, 1, failures);
      assertEqual(name + " OD", out.odMonthly, 147.69, failures);
    });

    t("nad cenzusom", {
      parents: 2,
      net: 4000,
      children: [{ school: "os", vrtec: true }],
      vrtecPrice: 500,
    }, function (out, name) {
      assertEqual(name + " OD", out.eligibleOd, false, failures);
      assertEqual(name + " vrtec razred", out.vrtecRow.razred, 9, failures);
      assertEqual(name + " vrtec %", out.vrtecRow.delez, 77, failures);
      assertEqual(name + " vrtec €", out.vrtecMonthly, 385, failures);
    });

    t("enostarševska +30 %", {
      parents: 1,
      singleParent: true,
      net: 400,
      children: [{ school: "os", vrtec: false }],
    }, function (out, name) {
      assertEqual(name + " OD", out.odMonthly, 192, failures);
    });

    t("predšolski +20 %", {
      parents: 2,
      net: 700,
      children: [{ school: "predsolski", vrtec: false }],
    }, function (out, name) {
      assertEqual(name + " OD", out.odMonthly, 177.23, failures);
    });

    t("oba dodatka 30 % in 20 %", {
      parents: 1,
      singleParent: true,
      net: 400,
      children: [{ school: "predsolski", vrtec: false }],
    }, function (out, name) {
      assertEqual(name + " OD", out.odMonthly, 230.4, failures);
    });

    t("vrtec: OD všteje v dohodek", {
      parents: 2,
      net: 700,
      children: [{ school: "predsolski", vrtec: true }],
      vrtecPrice: 500,
    }, function (out, name) {
      assertEqual(name + " OD razred", out.odRow && out.odRow.razred, 1, failures);
      assertEqual(name + " OD", out.odMonthly, 147.69, failures);
      assertEqual(name + " vrtec razred", out.vrtecRow.razred, 2, failures);
      assertEqual(name + " vrtec %", out.vrtecRow.delez, 10, failures);
      assertEqual(name + " vrtec €", out.vrtecMonthly, 50, failures);
    });

    t("SŠ 7. razred", {
      parents: 2,
      net: 3300.6,
      children: [{ school: "ss", vrtec: false }],
    }, function (out, name) {
      assertEqual(name + " OD", out.odMonthly, 37.25, failures);
    });

    t("meja 6/7", {
      parents: 2,
      net: 2576.04,
      children: [{ school: "os", vrtec: false }],
    }, function (out, name) {
      assertEqual(name + " razred", out.odRow && out.odRow.razred, 7, failures);
      assertEqual(name + " OD", out.odMonthly, 29.52, failures);
    });

    t("velika družina 3", {
      parents: 2,
      net: 1800,
      children: [
        { school: "os", vrtec: false },
        { school: "os", vrtec: false },
        { school: "predsolski", vrtec: true },
      ],
      vrtecPrice: 400,
    }, function (out, name) {
      assertEqual(name + " velika", out.velika, 510.35, failures);
      assertEqual(name + " 3. otrok brezplačno", out.vrtecChildren[0].free, true, failures);
      assertEqual(name + " vrtec €", out.vrtecMonthly, 0, failures);
    });

    t("velika družina 4", {
      parents: 2,
      net: 2000,
      children: [
        { school: "os", vrtec: false },
        { school: "os", vrtec: false },
        { school: "os", vrtec: false },
        { school: "predsolski", vrtec: false },
      ],
    }, function (out, name) {
      assertEqual(name + " velika", out.velika, 620.16, failures);
    });

    t("dva v vrtcu, mlajši prost", {
      parents: 2,
      net: 2000,
      children: [
        { school: "predsolski", vrtec: true },
        { school: "predsolski", vrtec: true },
      ],
      vrtecPrice: 400,
    }, function (out, name) {
      assertEqual(name + " starejši plača", out.vrtecChildren[0].free, false, failures);
      assertEqual(name + " mlajši prost", out.vrtecChildren[1].free, true, failures);
    });

    t("nezaposlena, pričakujemo", {
      parents: 2,
      recentBirth: true,
      insured: false,
      net: 2000,
      children: [{ school: "predsolski", vrtec: false }],
    }, function (out, name) {
      assertEqual(name + " člani", out.members, 3, failures);
      assertEqual(name + " pomoč", out.pomoc, 441.6, failures);
      assertEqual(name + " starševski", out.starsevski, 507.43, failures);
      assertEqual(name + " nadomestilo", out.nadomestilo, 0, failures);
    });

    t("zaposlena, bruto", {
      parents: 2,
      recentBirth: true,
      insured: true,
      bruto: 1800,
      net: 2500,
      children: [{ school: "predsolski", vrtec: false }],
    }, function (out, name) {
      assertEqual(name + " starševski", out.starsevski, 0, failures);
      assertEqual(name + " nadomestilo", out.nadomestilo, 1800, failures);
      assertEqual(name + " pomoč", out.pomoc, 441.6, failures);
    });

    t("razred 1 vrtec 0 %", {
      parents: 2,
      net: 400,
      children: [{ school: "predsolski", vrtec: true }],
      vrtecPrice: 500,
    }, function (out, name) {
      assertEqual(name + " OD razred", out.odRow && out.odRow.razred, 1, failures);
      assertEqual(name + " vrtec razred", out.vrtecRow.razred, 1, failures);
      assertEqual(name + " 0 %", out.vrtecMonthly, 0, failures);
    });

    t("pričakovanje ne doda skritega otroka", {
      parents: 2,
      expecting: true,
      recentBirth: true,
      net: 2000,
      children: [],
    }, function (out, name) {
      assertEqual(name + " člani", out.members, 2, failures);
      assertEqual(name + " otrok", out.nChildren, 0, failures);
      assertEqual(name + " pomoč", out.pomoc, 441.6, failures);
    });

    return { ok: failures.length === 0, failures: failures, n: 18 };
  }

  function loadData(rootEl) {
    const node = (rootEl && rootEl.querySelector("#ugodnosti-data")) || document.getElementById("ugodnosti-data");
    if (!node) return null;
    try {
      return JSON.parse(node.textContent);
    } catch (e) {
      return null;
    }
  }

  function schoolLabel(school) {
    if (school === "ss") return "srednja šola";
    if (school === "os") return "osnovna šola";
    return "predšolski";
  }

  function initUgodnosti() {
    const root = document.getElementById("ugo-app");
    if (!root || root.dataset.ugoBound === "1") return;
    root.dataset.ugoBound = "1";
    const data = loadData(root);
    if (!data) return;

    const state = {
      parents: 2,
      singleParent: false,
      recentBirth: true,
      existing: 1,
      children: [{ school: "predsolski", vrtec: false }],
      net: "",
      insured: true,
      bruto: "",
      vrtecPrice: "",
    };

    function needsVrtec() {
      return workingChildren().some(function (c) {
        return c.vrtec;
      });
    }

    function workingChildren() {
      const list = state.children.slice(0, state.existing).map(function (c) {
        return {
          school: c.school || "predsolski",
          vrtec: !!c.vrtec,
        };
      });
      while (list.length < state.existing) list.push({ school: "predsolski", vrtec: false });
      return list;
    }

    function readInputs() {
      return {
        parents: state.parents,
        singleParent: state.singleParent,
        recentBirth: state.recentBirth,
        insured: state.insured,
        net: Number(String(state.net).replace(",", ".")) || 0,
        bruto: Number(String(state.bruto).replace(",", ".")) || 0,
        vrtecPrice: Number(String(state.vrtecPrice).replace(",", ".")) || 0,
        children: workingChildren(),
      };
    }

    function resultHTML(out) {
      const items = [];
      const odOk = out.eligibleOd;
      items.push({
        title: "Otroški dodatek",
        amount: odOk ? formatEUR(out.odMonthly) + " / mesec" : "Ne pripada",
        year: odOk ? formatEUR(out.odYear) + " / leto" : "",
        ok: odOk,
        detail: odOk
          ? "Dohodkovni razred " +
            out.odRow.razred +
            " (" +
            formatEUR(out.incomePer) +
            " na družinskega člana). " +
            out.odChildren
              .map(function (c) {
                return (
                  c.index +
                  ". otrok (" +
                  schoolLabel(c.school) +
                  "): " +
                  formatEUR(c.amount) +
                  (c.notes.length ? " — " + c.notes.join(", ") : "")
                );
              })
              .join(". ")
          : "Povprečni mesečni dohodek na družinskega člana presega " +
            formatEUR(data.otroski_dodatek.dohodek_max) +
            ", ali v družini ni otrok.",
        rok: data.otroski_dodatek.rok,
        href: data.otroski_dodatek.euprava,
        vir: data.otroski_dodatek.vir,
      });

      if (out.vrtecChildren.length) {
        items.push({
          title: "Plačilo vrtca",
          amount: formatEUR(out.vrtecMonthly) + " / mesec",
          year: "",
          ok: true,
          detail:
            "Razred " +
            out.vrtecRow.razred +
            " (" +
            out.vrtecRow.delez +
            " % cene programa). V dohodek za vrtec je vštet otroški dodatek (" +
            formatEUR(out.vrtecIncomePer) +
            " na člana). " +
            out.vrtecChildren
              .map(function (c) {
                return (
                  c.index +
                  ". otrok: " +
                  (c.free ? "oproščen plačila. " + c.reason : formatEUR(c.amount) + " (" + c.delez + " %).")
                );
              })
              .join(" "),
          rok: "Ista vloga za pravice iz javnih sredstev kot za otroški dodatek.",
          href: data.vrtec.euprava,
          vir: data.vrtec.vir,
        });
      }

      items.push({
        title: "Pomoč ob rojstvu otroka",
        amount: out.pomoc ? formatEUR(out.pomoc) + " enkratno" : "Ni v tem izračunu",
        year: "",
        ok: !!out.pomoc,
        detail: out.pomoc
          ? "Enkratni znesek za nakup opreme za novorojenčka."
          : "Prikaže se, če označite, da pričakujete otroka ali je najmlajši novorojenček (rok 60 dni po rojstvu).",
        rok: data.pomoc_ob_rojstvu.rok,
        href: data.pomoc_ob_rojstvu.euprava,
        vir: data.pomoc_ob_rojstvu.vir,
      });

      if (!out.insured) {
        items.push({
          title: "Starševski dodatek",
          amount: out.starsevski ? formatEUR(out.starsevski) + " / mesec" : "Ni v tem izračunu",
          year: out.starsevski ? formatEUR(money(out.starsevski * 12)) + " / 365 dni" : "",
          ok: !!out.starsevski,
          detail: "Za starše, ki niso zavarovani za starševsko varstvo (npr. študentke, nezaposlene). Pravica traja 365 dni od rojstva.",
          rok: data.starsevski_dodatek.rok,
          href: data.starsevski_dodatek.euprava,
          vir: data.starsevski_dodatek.vir,
        });
      } else {
        items.push({
          title: "Starševsko nadomestilo",
          amount: out.nadomestilo ? "približno " + formatEUR(out.nadomestilo) + " / mesec" : "Vnesite bruto plačo za oceno",
          year: "",
          ok: !!out.nadomestilo,
          detail: data.starsevsko_nadomestilo.opomba,
          rok: data.starsevsko_nadomestilo.rok,
          href: data.starsevsko_nadomestilo.euprava,
          vir: data.starsevsko_nadomestilo.vir,
        });
      }

      items.push({
        title: "Dodatek za veliko družino",
        amount: out.velika ? formatEUR(out.velika) + " / leto" : "Ne pripada (manj kot 3 otroci)",
        year: "",
        ok: out.velika > 0,
        detail: out.velika
          ? out.nChildren >= 4
            ? "Družina s štirimi ali več otroki."
            : "Družina s tremi otroki."
          : "Letni prejemek za družine s tremi ali več otroki.",
        rok: data.dodatek_za_veliko_druzino.rok,
        href: data.dodatek_za_veliko_druzino.euprava,
        vir: data.dodatek_za_veliko_druzino.vir,
      });

      const cards = items
        .map(function (item) {
          return (
            '<article class="ugo-benefit' +
            (item.ok ? " is-ok" : "") +
            '"><h3>' +
            item.title +
            "</h3><p class=\"ugo-benefit__sum\">" +
            item.amount +
            (item.year ? " · " + item.year : "") +
            "</p><p class=\"ugo-benefit__detail\">" +
            item.detail +
            '</p><p class="ugo-benefit__rok">' +
            item.rok +
            '</p><p class="ugo-benefit__links"><a href="' +
            item.href +
            '" target="_blank" rel="noopener">Vloga na e-Uprava</a> · <a href="' +
            item.vir +
            '" target="_blank" rel="noopener">Vir gov.si</a></p></article>'
          );
        })
        .join("");

      return (
        '<div class="doh-result ugo-result">' +
        '<p class="doh-result__sub">Ocena za prvo leto<br><small>(brez nadomestila in vrtca)</small></p>' +
        '<p class="doh-result__big">' +
        formatEUR(out.yearBenefits) +
        "</p>" +
        '<p class="doh-help">Družina: ' +
        out.members +
        " oseb · " +
        formatEUR(out.incomePer) +
        " neto na člana na mesec.</p>" +
        '<div class="ugo-benefits">' +
        cards +
        "</div></div>"
      );
    }

    function formHTML() {
      const kids = workingChildren();
      const childRows = kids
        .map(function (c, i) {
          return (
            '<article class="ugo-child"><h3>' +
            (i + 1) +
            ". otrok (od najstarejšega)</h3>" +
            '<div class="doh-seg" role="group">' +
            '<button type="button" class="doh-seg__btn" data-ugo-school="' +
            i +
            '" data-val="predsolski" aria-pressed="' +
            (c.school === "predsolski") +
            '">Predšolski</button>' +
            '<button type="button" class="doh-seg__btn" data-ugo-school="' +
            i +
            '" data-val="os" aria-pressed="' +
            (c.school === "os") +
            '">OŠ</button>' +
            '<button type="button" class="doh-seg__btn" data-ugo-school="' +
            i +
            '" data-val="ss" aria-pressed="' +
            (c.school === "ss") +
            '">Srednja šola</button></div>' +
            (c.school === "predsolski"
              ? '<label class="doh-check doh-check--block"><input type="checkbox" data-ugo-kid-vrtec="' +
                i +
                '" ' +
                (c.vrtec ? "checked" : "") +
                "> Vključen v vrtec</label>"
              : "") +
            "</article>"
          );
        })
        .join("");

      return (
        '<section class="doh-card"><h3>Kakšna je sestava vaše družine?</h3>' +
        '<p class="doh-help">V število otrok vštejte tudi otroka, ki ga pričakujete. Število staršev določi, na koliko oseb se deli dohodek.</p>' +
        '<div class="doh-seg" role="group" aria-label="Število staršev">' +
        '<button type="button" class="doh-seg__btn" data-ugo-parents="2" aria-pressed="' +
        (state.parents === 2) +
        '">Starša</button>' +
        '<button type="button" class="doh-seg__btn" data-ugo-parents="1" aria-pressed="' +
        (state.parents === 1) +
        '">Oče ali Mama</button></div>' +
        (state.parents === 1
          ? '<label class="doh-check doh-check--block"><input type="checkbox" data-ugo-single ' +
            (state.singleParent ? "checked" : "") +
            "> <span>Enostarševska družina po zakonu <small>(+30 % otroški dodatek. Eden izmed staršev je umrl, je neznan ali preživnina ni plačana)</small></span></label>"
          : "") +
        '<label class="doh-field" style="margin-top:1rem;max-width:14rem"><span>Koliko otrok je v družini?</span>' +
        '<input type="number" min="0" max="12" step="1" inputmode="numeric" data-ugo-existing value="' +
        state.existing +
        '"></label>' +
        '<label class="doh-check doh-check--block"><input type="checkbox" data-ugo-recent ' +
        (state.recentBirth ? "checked" : "") +
        "> Pričakujemo otroka ali je najmlajši novorojenček</label></section>" +
        (state.existing > 0
          ? '<section class="doh-card"><h3>Otroci</h3><p class="doh-help">Od najstarejšega do najmlajšega. Predšolski pomeni, da otrok še ni v šoli — to ni isto kot vrtec. Če je v vrtcu, to označite pri otroku.</p>' +
            childRows +
            "</section>"
          : "") +
        '<section class="doh-card"><h3>Dohodek in zaposlitev</h3>' +
        '<p class="doh-help">Povprečni mesečni neto dohodek vseh družinskih članov skupaj. CSD upošteva tudi premoženje, zato je to ocena. Starševsko nadomestilo pripada zavarovanim za starševsko varstvo, sicer starševski dodatek.</p>' +
        '<div class="doh-grid">' +
        '<label class="doh-field"><span>Neto mesečno, v evrih</span>' +
        '<input type="number" min="0" step="0.01" inputmode="decimal" data-ugo-net value="' +
        state.net +
        '" placeholder="npr. 2800"></label>' +
        (state.insured
          ? '<label class="doh-field"><span>Bruto plača mesečno</span>' +
            '<input type="number" min="0" step="0.01" inputmode="decimal" data-ugo-bruto value="' +
            state.bruto +
            '" placeholder="npr. 1800"></label>'
          : "") +
        "</div>" +
        '<div class="doh-seg" role="group" style="margin-top:1rem">' +
        '<button type="button" class="doh-seg__btn" data-ugo-insured="1" aria-pressed="' +
        state.insured +
        '">Zaposlen(a)/Zavarovan(a)</button>' +
        '<button type="button" class="doh-seg__btn" data-ugo-insured="0" aria-pressed="' +
        !state.insured +
        '">Nisem zavarovan(a)</button></div></section>' +
        (needsVrtec()
          ? '<section class="doh-card"><h3>Cena programa vrtca</h3>' +
            '<p class="doh-help">Mesečna cena programa, ki jo določi občina. Plačilo je odstotek te cene, ne polna cena.</p>' +
            '<label class="doh-field"><span>Cena programa, € / mesec</span>' +
            '<input type="number" min="0" step="0.01" inputmode="decimal" data-ugo-price value="' +
            state.vrtecPrice +
            '" placeholder="npr. 450"></label></section>'
          : "")
      );
    }

    function renderForm() {
      const mount = root.querySelector("[data-ugo-form]");
      if (mount) mount.innerHTML = formHTML();
    }

    function renderResults() {
      const mount = root.querySelector("[data-ugo-result]");
      if (mount) mount.innerHTML = resultHTML(calculate(readInputs(), data));
    }

    function render() {
      renderForm();
      renderResults();
    }

    function bindStateFromEvent(e) {
      const t = e.target;
      if (t.matches("[data-ugo-existing]")) {
        state.existing = Math.max(0, Math.min(12, parseInt(t.value, 10) || 0));
        while (state.children.length < state.existing) {
          state.children.push({ school: "predsolski", vrtec: false });
        }
      }
      if (t.matches("[data-ugo-net]")) state.net = t.value;
      if (t.matches("[data-ugo-bruto]")) state.bruto = t.value;
      if (t.matches("[data-ugo-price]")) state.vrtecPrice = t.value;
      if (t.matches("[data-ugo-single]")) state.singleParent = t.checked;
      if (t.matches("[data-ugo-recent]")) {
        state.recentBirth = t.checked;
        if (t.checked && state.existing < 1) {
          state.existing = 1;
          if (!state.children[0]) state.children[0] = { school: "predsolski", vrtec: false };
        }
      }
      if (t.matches("[data-ugo-kid-vrtec]")) {
        const i = Number(t.getAttribute("data-ugo-kid-vrtec"));
        if (!state.children[i]) state.children[i] = { school: "predsolski", vrtec: false };
        state.children[i].vrtec = t.checked;
      }
    }

    function focusAttr(sel) {
      const el = root.querySelector(sel);
      if (!el) return;
      el.focus();
      if (typeof el.value === "string") {
        const n = el.value.length;
        try {
          el.setSelectionRange(n, n);
        } catch (err) {}
      }
    }

    root.addEventListener("input", function (e) {
      const t = e.target;
      bindStateFromEvent(e);
      if (t.matches("[data-ugo-existing]")) {
        renderForm();
        focusAttr("[data-ugo-existing]");
      }
      renderResults();
    });
    root.addEventListener("change", function (e) {
      bindStateFromEvent(e);
      if (e.target.matches("[data-ugo-single], [data-ugo-recent], [data-ugo-kid-vrtec]")) {
        renderForm();
      }
      renderResults();
    });

    root.addEventListener("click", function (e) {
      const btn = e.target.closest("button");
      if (!btn || !root.contains(btn)) return;
      if (btn.hasAttribute("data-ugo-parents")) {
        state.parents = Number(btn.getAttribute("data-ugo-parents"));
        if (state.parents === 2) state.singleParent = false;
        render();
        return;
      }
      if (btn.hasAttribute("data-ugo-insured")) {
        state.insured = btn.getAttribute("data-ugo-insured") === "1";
        render();
        return;
      }
      if (btn.hasAttribute("data-ugo-school")) {
        const i = Number(btn.getAttribute("data-ugo-school"));
        if (!state.children[i]) state.children[i] = { school: "predsolski", vrtec: false };
        state.children[i].school = btn.getAttribute("data-val");
        if (state.children[i].school !== "predsolski") state.children[i].vrtec = false;
        render();
      }
    });

    render();

    const test = runTests(data);
    if (!test.ok) {
      console.error("Ugodnosti tests failed", test.failures);
    } else {
      console.info("Ugodnosti: " + test.n + " testov OK");
    }
  }

  root.Ugodnosti = { calculate: calculate, runTests: runTests, formatEUR: formatEUR, money: money };

  if (typeof document !== "undefined") {
    document.addEventListener("site-drawer:open", function (event) {
      if (event.detail && event.detail.id === "ugodnosti") initUgodnosti();
    });
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initUgodnosti);
    } else {
      initUgodnosti();
    }
  }

  if (typeof module === "object" && module.exports) {
    module.exports = root.Ugodnosti;
  }
})(typeof window !== "undefined" ? window : globalThis);
