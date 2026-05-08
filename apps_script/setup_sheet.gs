// ══════════════════════════════════════════════════════════════════════════
// PRISMA Sheet Design — FIXED v8
// - Every function is standalone (no parameters needed)
// - ZERO merge() calls — all text uses setValue only (no merge errors)
// - ensureSupervisorColumns creates missing columns automatically
// - Dashboard: SR/YR declared
// ══════════════════════════════════════════════════════════════════════════

function designSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("SCREENED");
  if (!sh) { Logger.log("SCREENED not found"); return; }
  var lr = sh.getLastRow();
  var lc = sh.getLastColumn();
  var dr = lr - 1;
  if (dr < 1) return;

  sh.getRange(1,1,1,lc).setBackground("#1B2A4A").setFontColor("#FFF")
    .setFontWeight("bold").setFontSize(9).setFontFamily("Arial")
    .setHorizontalAlignment("center");
  sh.setRowHeight(1, 34);
  sh.setFrozenRows(1);
  sh.getRange(2,1,dr,lc).setFontSize(9).setFontFamily("Arial")
    .setVerticalAlignment("middle").setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  sh.getRange(2,1,dr,lc).clearDataValidations();

  var hdr = sh.getRange(1,1,1,lc).getValues()[0];
  function fci(n) { for(var i=0;i<hdr.length;i++) if(String(hdr[i]).trim()===n) return i+1; return -1; }

  var manualCols = ["filter_manuel","filter_readfulltext","filter_supervisor2","filter_supervisor3"];
  for (var c = 0; c < manualCols.length; c++) {
    var ci = fci(manualCols[c]);
    if (ci > 0) {
      var rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(["INCLUDE","EXCLUDE"], true)
        .setAllowInvalid(true).build();
      sh.getRange(2, ci, dr, 1).setDataValidation(rule);
    }
  }

  var absC = fci("abstract");
  if (absC > 0) sh.hideColumns(absC);

  try { var f = sh.getFilter(); if(f) f.remove(); } catch(e) {}
  sh.getRange(1,1,lr,lc).createFilter();
  Logger.log("designSheet done");
}

// ═══════════════════════════════════════════════════════════
// Ensure supervisor columns exist in SCREENED
// ═══════════════════════════════════════════════════════════
function ensureSupervisorColumns() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("SCREENED");
  if (!sh) return;
  var hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var needed = ["filter_supervisor2","raison_supervisor2","filter_supervisor3","raison_supervisor3"];
  var nextCol = sh.getLastColumn() + 1;
  for (var i = 0; i < needed.length; i++) {
    var found = false;
    for (var j = 0; j < hdr.length; j++) {
      if (String(hdr[j]).trim() === needed[i]) { found = true; break; }
    }
    if (!found) {
      sh.getRange(1, nextCol).setValue(needed[i])
        .setBackground("#1B2A4A").setFontColor("#FFF").setFontWeight("bold").setFontSize(9);
      Logger.log("Added column: " + needed[i]);
      nextCol++;
    }
  }
}

function createTabs() {
  ensureSupervisorColumns();
  SpreadsheetApp.flush(); // Force write before re-reading

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sep = getSep(ss);
  var sh = ss.getSheetByName("SCREENED");
  if (!sh) return;
  var lr = sh.getLastRow();
  var lc = sh.getLastColumn();
  var hdr = sh.getRange(1,1,1,lc).getValues()[0];
  function fc(n) { for(var i=0;i<hdr.length;i++) if(String(hdr[i]).trim()===n) return colLetter(i+1); return null; }

  var FA = fc("filter_auto");
  var FL = fc("filter_llm");
  var FM = fc("filter_manuel");
  var FP = fc("filter_pdf");
  var FR = fc("filter_readfulltext");

  if (FA) makeSmartTab(ss, sh, "REVIEW_LLM", "#7C3AED", lr, lc, sep,
    "REGEXMATCH(SCREENED!" + FA + "2:" + FA + lr + sep + "\"INCLUDE|BORDERLINE\")",
    ["title","authors","year","doi","venue_name","source","q1_ad","q2_speech","q3_ai","filter_auto","abstract"], hdr);

  if (FL) makeSmartTab(ss, sh, "REVIEW_MANUEL", "#0891B2", lr, lc, sep,
    "SCREENED!" + FL + "2:" + FL + lr + "=\"INCLUDE\"",
    ["title","year","venue_name","venue_quality","filter_auto","filter_llm","raison_llm","filter_manuel","raison_manuelle","abstract"], hdr);

  if (FA && FL) makeSmartTab(ss, sh, "DISAGREEMENTS", "#EA580C", lr, lc, sep,
    "SCREENED!" + FA + "2:" + FA + lr + "=\"INCLUDE\"" + sep + "SCREENED!" + FL + "2:" + FL + lr + "=\"EXCLUDE\"",
    ["title","year","venue_name","filter_auto","filter_llm","raison_llm","filter_manuel","raison_manuelle","abstract"], hdr);

  if (FM) makeSmartTab(ss, sh, "REVIEW_PDF", "#BE185D", lr, lc, sep,
    "SCREENED!" + FM + "2:" + FM + lr + "=\"INCLUDE\"",
    ["title","authors","year","doi","venue_name","filter_manuel","filter_pdf","pdf_status","drive_link"], hdr);

  if (FP) makeSmartTab(ss, sh, "REVIEW_FULLTEXT", "#D97706", lr, lc, sep,
    "SCREENED!" + FP + "2:" + FP + lr + "=\"INCLUDE\"",
    ["title","authors","year","venue_name","venue_quality","drive_link","filter_readfulltext","raison_readfulltext"], hdr);

  if (FP) makeSmartTab(ss, sh, "PDF_NOT_FOUND", "#991B1B", lr, lc, sep,
    "SCREENED!" + FP + "2:" + FP + lr + "=\"EXCLUDE\"",
    ["title","authors","year","doi","venue_name","source","filter_pdf","pdf_status"], hdr);

  if (FR) makeSmartTab(ss, sh, "FINAL_INCLUDED", "#059669", lr, lc, sep,
    "SCREENED!" + FR + "2:" + FR + lr + "=\"INCLUDE\"",
    ["title","authors","year","doi","venue_name","venue_quality","publication_type","language_studied","citations","drive_link"], hdr);

  if (FR) makeSmartTab(ss, sh, "ALL_EXCLUDED", "#DC2626", lr, lc, sep,
    "SCREENED!" + FR + "2:" + FR + lr + "=\"EXCLUDE\"",
    ["title","year","venue_name","filter_auto","filter_llm","raison_llm","filter_manuel","filter_pdf","filter_readfulltext","raison_readfulltext"], hdr);

  if (FA) makeSmartTab(ss, sh, "REVIEW_SUPERVISOR2", "#6366F1", lr, lc, sep,
    "REGEXMATCH(SCREENED!" + FA + "2:" + FA + lr + sep + "\"INCLUDE|BORDERLINE\")",
    ["title","year","venue_name","abstract","filter_supervisor2","raison_supervisor2"], hdr);

  if (FA) makeSmartTab(ss, sh, "REVIEW_SUPERVISOR3", "#EC4899", lr, lc, sep,
    "REGEXMATCH(SCREENED!" + FA + "2:" + FA + lr + sep + "\"INCLUDE|BORDERLINE\")",
    ["title","year","venue_name","abstract","filter_supervisor3","raison_supervisor3"], hdr);

  createKappaTab();

  Logger.log("createTabs done — 11 tabs");
}

// ═══════════════════════════════════════════════════════════
// KAPPA TAB — fully standalone, NO merge()
// ═══════════════════════════════════════════════════════════
function createKappaTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("SCREENED");
  if (!sh) { Logger.log("SCREENED not found"); return; }
  var sep = getSep(ss);
  var lr = sh.getLastRow();
  var lc = sh.getLastColumn();
  var hdr = sh.getRange(1,1,1,lc).getValues()[0];
  function fc(n) { for(var i=0;i<hdr.length;i++) if(String(hdr[i]).trim()===n) return colLetter(i+1); return null; }

  var FM = fc("filter_manuel");
  var FS2 = fc("filter_supervisor2");
  var FS3 = fc("filter_supervisor3");
  var FL = fc("filter_llm");
  if (!FM) { Logger.log("KAPPA: filter_manuel not found"); return; }

  var tab = ss.getSheetByName("KAPPA_RESULTS"); if (tab) ss.deleteSheet(tab);
  tab = ss.insertSheet("KAPPA_RESULTS");

  // Title — NO merge, just use column A wide
  tab.getRange("A1").setValue("COHEN'S KAPPA — Inter-Rater Reliability")
    .setBackground("#1B2A4A").setFontColor("#FFF").setFontSize(13).setFontWeight("bold");
  tab.getRange("B1:H1").setBackground("#1B2A4A");
  tab.setRowHeight(1, 40);
  tab.setColumnWidth(1, 200);
  tab.setColumnWidth(2, 100);
  tab.setColumnWidth(3, 100);
  tab.setColumnWidth(4, 100);

  // ═══ PAIR 1: You vs Supervisor 2 ═══
  tab.getRange("A3").setValue("KAPPA 1: You vs Supervisor 2")
    .setFontWeight("bold").setBackground("#EEF2FF").setFontSize(11);
  tab.getRange("B3:D3").setBackground("#EEF2FF");

  if (FM && FS2) {
    tab.getRange("A4:D4").setValues([["","Sup2=INCLUDE","Sup2=EXCLUDE","Total"]]).setFontWeight("bold").setBackground("#E2E8F0");
    tab.getRange("A5").setValue("You=INCLUDE");
    tab.getRange("B5").setValue("=COUNTIFS(SCREENED!"+FM+"2:"+FM+lr+sep+"\"INCLUDE\""+sep+"SCREENED!"+FS2+"2:"+FS2+lr+sep+"\"INCLUDE\")");
    tab.getRange("C5").setValue("=COUNTIFS(SCREENED!"+FM+"2:"+FM+lr+sep+"\"INCLUDE\""+sep+"SCREENED!"+FS2+"2:"+FS2+lr+sep+"\"EXCLUDE\")");
    tab.getRange("D5").setValue("=B5+C5");
    tab.getRange("A6").setValue("You=EXCLUDE");
    tab.getRange("B6").setValue("=COUNTIFS(SCREENED!"+FM+"2:"+FM+lr+sep+"\"EXCLUDE\""+sep+"SCREENED!"+FS2+"2:"+FS2+lr+sep+"\"INCLUDE\")");
    tab.getRange("C6").setValue("=COUNTIFS(SCREENED!"+FM+"2:"+FM+lr+sep+"\"EXCLUDE\""+sep+"SCREENED!"+FS2+"2:"+FS2+lr+sep+"\"EXCLUDE\")");
    tab.getRange("D6").setValue("=B6+C6");
    tab.getRange("A7").setValue("Total").setFontWeight("bold");
    tab.getRange("B7").setValue("=B5+B6"); tab.getRange("C7").setValue("=C5+C6"); tab.getRange("D7").setValue("=B7+C7");

    tab.getRange("A9").setValue("n (rated by both)"); tab.getRange("B9").setValue("=D7");
    tab.getRange("A10").setValue("Po (observed)");
    tab.getRange("B10").setValue("=IF(D7>0" + sep + "(B5+C6)/D7" + sep + "0)").setNumberFormat("0.000");
    tab.getRange("A11").setValue("Pe (expected)");
    tab.getRange("B11").setValue("=IF(D7>0" + sep + "((D5*B7)+(D6*C7))/(D7*D7)" + sep + "0)").setNumberFormat("0.000");
    tab.getRange("A12").setValue("Cohen's Kappa (κ)");
    tab.getRange("B12").setValue("=IF(AND(D7>0"+sep+"B11<1)" + sep + "(B10-B11)/(1-B11)" + sep + "0)").setNumberFormat("0.000");
    tab.getRange("B12").setFontSize(16).setFontWeight("bold");
    tab.getRange("A13").setValue("Interprétation");
    tab.getRange("B13").setValue("=IF(B12>=0.8"+sep+"\"Excellent\""+sep+"IF(B12>=0.6"+sep+"\"Bon\""+sep+"IF(B12>=0.4"+sep+"\"Modéré\""+sep+"\"Faible\")))");
    tab.getRange("B13").setFontWeight("bold");
  } else {
    tab.getRange("A4").setValue("Colonnes supervisor manquantes → lancez ensureSupervisorColumns()");
  }

  // ═══ PAIR 2: You vs LLM ═══
  tab.getRange("A16").setValue("KAPPA 2: You vs LLM")
    .setFontWeight("bold").setBackground("#F5F3FF").setFontSize(11);
  tab.getRange("B16:D16").setBackground("#F5F3FF");

  if (FM && FL) {
    tab.getRange("A17:D17").setValues([["","LLM=INCLUDE","LLM=EXCLUDE","Total"]]).setFontWeight("bold").setBackground("#E2E8F0");
    tab.getRange("A18").setValue("You=INCLUDE");
    tab.getRange("B18").setValue("=COUNTIFS(SCREENED!"+FM+"2:"+FM+lr+sep+"\"INCLUDE\""+sep+"SCREENED!"+FL+"2:"+FL+lr+sep+"\"INCLUDE\")");
    tab.getRange("C18").setValue("=COUNTIFS(SCREENED!"+FM+"2:"+FM+lr+sep+"\"INCLUDE\""+sep+"SCREENED!"+FL+"2:"+FL+lr+sep+"\"EXCLUDE\")");
    tab.getRange("D18").setValue("=B18+C18");
    tab.getRange("A19").setValue("You=EXCLUDE");
    tab.getRange("B19").setValue("=COUNTIFS(SCREENED!"+FM+"2:"+FM+lr+sep+"\"EXCLUDE\""+sep+"SCREENED!"+FL+"2:"+FL+lr+sep+"\"INCLUDE\")");
    tab.getRange("C19").setValue("=COUNTIFS(SCREENED!"+FM+"2:"+FM+lr+sep+"\"EXCLUDE\""+sep+"SCREENED!"+FL+"2:"+FL+lr+sep+"\"EXCLUDE\")");
    tab.getRange("D19").setValue("=B19+C19");
    tab.getRange("A20").setValue("Total").setFontWeight("bold");
    tab.getRange("B20").setValue("=B18+B19"); tab.getRange("C20").setValue("=C18+C19"); tab.getRange("D20").setValue("=B20+C20");

    tab.getRange("A22").setValue("n"); tab.getRange("B22").setValue("=D20");
    tab.getRange("A23").setValue("Po"); tab.getRange("B23").setValue("=IF(D20>0" + sep + "(B18+C19)/D20" + sep + "0)").setNumberFormat("0.000");
    tab.getRange("A24").setValue("Pe"); tab.getRange("B24").setValue("=IF(D20>0" + sep + "((D18*B20)+(D19*C20))/(D20*D20)" + sep + "0)").setNumberFormat("0.000");
    tab.getRange("A25").setValue("Kappa (κ)");
    tab.getRange("B25").setValue("=IF(AND(D20>0"+sep+"B24<1)" + sep + "(B23-B24)/(1-B24)" + sep + "0)").setNumberFormat("0.000");
    tab.getRange("B25").setFontSize(16).setFontWeight("bold");
  }

  // ═══ PAIR 3: Supervisor 2 vs LLM ═══
  tab.getRange("A28").setValue("KAPPA 3: Supervisor 2 vs LLM")
    .setFontWeight("bold").setBackground("#ECFDF5").setFontSize(11);
  tab.getRange("B28:D28").setBackground("#ECFDF5");

  if (FS2 && FL) {
    tab.getRange("A29:D29").setValues([["","LLM=INCLUDE","LLM=EXCLUDE","Total"]]).setFontWeight("bold").setBackground("#E2E8F0");
    tab.getRange("A30").setValue("Sup2=INCLUDE");
    tab.getRange("B30").setValue("=COUNTIFS(SCREENED!"+FS2+"2:"+FS2+lr+sep+"\"INCLUDE\""+sep+"SCREENED!"+FL+"2:"+FL+lr+sep+"\"INCLUDE\")");
    tab.getRange("C30").setValue("=COUNTIFS(SCREENED!"+FS2+"2:"+FS2+lr+sep+"\"INCLUDE\""+sep+"SCREENED!"+FL+"2:"+FL+lr+sep+"\"EXCLUDE\")");
    tab.getRange("D30").setValue("=B30+C30");
    tab.getRange("A31").setValue("Sup2=EXCLUDE");
    tab.getRange("B31").setValue("=COUNTIFS(SCREENED!"+FS2+"2:"+FS2+lr+sep+"\"EXCLUDE\""+sep+"SCREENED!"+FL+"2:"+FL+lr+sep+"\"INCLUDE\")");
    tab.getRange("C31").setValue("=COUNTIFS(SCREENED!"+FS2+"2:"+FS2+lr+sep+"\"EXCLUDE\""+sep+"SCREENED!"+FL+"2:"+FL+lr+sep+"\"EXCLUDE\")");
    tab.getRange("D31").setValue("=B31+C31");
    tab.getRange("A32").setValue("Total").setFontWeight("bold");
    tab.getRange("B32").setValue("=B30+B31"); tab.getRange("C32").setValue("=C30+C31"); tab.getRange("D32").setValue("=B32+C32");

    tab.getRange("A34").setValue("n"); tab.getRange("B34").setValue("=D32");
    tab.getRange("A35").setValue("Po"); tab.getRange("B35").setValue("=IF(D32>0" + sep + "(B30+C31)/D32" + sep + "0)").setNumberFormat("0.000");
    tab.getRange("A36").setValue("Pe"); tab.getRange("B36").setValue("=IF(D32>0" + sep + "((D30*B32)+(D31*C32))/(D32*D32)" + sep + "0)").setNumberFormat("0.000");
    tab.getRange("A37").setValue("Kappa (κ)");
    tab.getRange("B37").setValue("=IF(AND(D32>0"+sep+"B36<1)" + sep + "(B35-B36)/(1-B36)" + sep + "0)").setNumberFormat("0.000");
    tab.getRange("B37").setFontSize(16).setFontWeight("bold");
  }

  // ═══ SUMMARY TABLE ═══
  tab.getRange("A40").setValue("RÉSUMÉ DES 3 KAPPAS")
    .setFontWeight("bold").setBackground("#FEF3C7").setFontSize(11);
  tab.getRange("B40:D40").setBackground("#FEF3C7");
  tab.getRange("A41:D41").setValues([["Comparaison","κ","Interprétation","Action"]]).setFontWeight("bold").setBackground("#E2E8F0");

  tab.getRange("A42").setValue("You vs Supervisor2");
  if (FM && FS2) {
    tab.getRange("B42").setValue("=B12").setNumberFormat("0.000");
    tab.getRange("C42").setValue("=B13");
    tab.getRange("D42").setValue("=IF(B12>=0.8"+sep+"\"OK\""+sep+"IF(B12>=0.6"+sep+"\"Acceptable\""+sep+"\"Arbitrage\"))");
  }
  tab.getRange("A43").setValue("You vs LLM");
  if (FM && FL) {
    tab.getRange("B43").setValue("=B25").setNumberFormat("0.000");
    tab.getRange("C43").setValue("=IF(B25>=0.8"+sep+"\"Excellent\""+sep+"IF(B25>=0.6"+sep+"\"Bon\""+sep+"\"Modéré\"))");
  }
  tab.getRange("A44").setValue("Sup2 vs LLM");
  if (FS2 && FL) {
    tab.getRange("B44").setValue("=B37").setNumberFormat("0.000");
    tab.getRange("C44").setValue("=IF(B37>=0.8"+sep+"\"Excellent\""+sep+"IF(B37>=0.6"+sep+"\"Bon\""+sep+"\"Modéré\"))");
  }

  // Instructions
  tab.getRange("A47").setValue("INSTRUCTIONS").setFontWeight("bold").setBackground("#F1F5F9");
  tab.getRange("A48").setValue("1. Sélectionner 50 articles (filter_auto=INCLUDE+BORDERLINE)");
  tab.getRange("A49").setValue("2. Superviseur remplit filter_supervisor2 (titre+abstract seulement)");
  tab.getRange("A50").setValue("3. Les Kappas se calculent automatiquement ci-dessus");
  tab.getRange("A51").setValue("4. Si κ < 0.60 → Arbitrage Abdellah Adib via REVIEW_SUPERVISOR3");

  tab.setTabColor("#6366F1");
  tab.setFrozenRows(1);
  Logger.log("KAPPA tab done");
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD — standalone, NO merge()
// ═══════════════════════════════════════════════════════════
function createDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sep = getSep(ss);
  var sh = ss.getSheetByName("SCREENED");
  if (!sh) { Logger.log("SCREENED not found"); return; }
  var lr = sh.getLastRow();
  var lc = sh.getLastColumn();
  var hdr = sh.getRange(1,1,1,lc).getValues()[0];
  function fc(n) { for(var i=0;i<hdr.length;i++) if(String(hdr[i]).trim()===n) return colLetter(i+1); return null; }

  var FA=fc("filter_auto"), FL=fc("filter_llm"), FM=fc("filter_manuel");
  var FP=fc("filter_pdf"), FR=fc("filter_readfulltext"), TI=fc("title");
  var VQ=fc("venue_quality"), PT=fc("publication_type");
  var SR=fc("source"), YR=fc("year");
  if (!FA||!TI) return;

  var d = ss.getSheetByName("Dashboard"); if (d) ss.deleteSheet(d);
  d = ss.insertSheet("Dashboard", 0);

  // Title — NO merge
  d.getRange("A1").setValue("PRISMA Dashboard — 5-Layer Screening")
    .setBackground("#1B2A4A").setFontColor("#FFF").setFontSize(14).setFontWeight("bold");
  d.getRange("B1:N1").setBackground("#1B2A4A");
  d.setRowHeight(1, 44);

  // FUNNEL
  d.getRange("A3").setValue("SCREENING FUNNEL").setFontWeight("bold").setBackground("#F1F5F9").setFontSize(11);
  d.getRange("B3:G3").setBackground("#F1F5F9");
  d.getRange("A4:G4").setValues([["Step","Layer","Input","INCLUDE","EXCLUDE","Pending","Action"]]).setFontWeight("bold").setBackground("#E2E8F0");

  d.getRange("A5").setValue("1"); d.getRange("B5").setValue("filter_auto");
  d.getRange("C5").setValue("=COUNTA(SCREENED!" + TI + "2:" + TI + lr + ")");
  putCF2(d,"D5",FA,"INCLUDE",lr,sep); putCF2(d,"E5",FA,"EXCLUDE",lr,sep);
  d.getRange("F5").setValue("=COUNTIF(SCREENED!" + FA + "2:" + FA + lr + sep + "\"BORDERLINE*\")");
  d.getRange("G5").setValue("Keywords");

  if(FL){d.getRange("A6").setValue("2");d.getRange("B6").setValue("filter_llm");d.getRange("C6").setValue("=D5+F5");
  putCF2(d,"D6",FL,"INCLUDE",lr,sep);putCF2(d,"E6",FL,"EXCLUDE",lr,sep);
  d.getRange("F6").setValue("=COUNTBLANK(SCREENED!" + FL + "2:" + FL + lr + ")");d.getRange("G6").setValue("Groq LLM");}

  if(FM){d.getRange("A7").setValue("3");d.getRange("B7").setValue("filter_manuel");d.getRange("C7").setValue("=D6");
  putCF2(d,"D7",FM,"INCLUDE",lr,sep);putCF2(d,"E7",FM,"EXCLUDE",lr,sep);
  d.getRange("F7").setValue("=COUNTBLANK(SCREENED!" + FM + "2:" + FM + lr + ")");d.getRange("G7").setValue("You verify");}

  if(FP){d.getRange("A8").setValue("4");d.getRange("B8").setValue("filter_pdf");d.getRange("C8").setValue("=D7");
  putCF2(d,"D8",FP,"INCLUDE",lr,sep);putCF2(d,"E8",FP,"EXCLUDE",lr,sep);d.getRange("G8").setValue("PDF download");}

  if(FR){d.getRange("A9").setValue("5");d.getRange("B9").setValue("filter_readfulltext");d.getRange("C9").setValue("=D8");
  putCF2(d,"D9",FR,"INCLUDE",lr,sep);putCF2(d,"E9",FR,"EXCLUDE",lr,sep);
  d.getRange("F9").setValue("=COUNTBLANK(SCREENED!" + FR + "2:" + FR + lr + ")");d.getRange("G9").setValue("You read PDF");}

  // FINAL BIG
  if(FR){d.getRange("I4").setValue("FINAL").setFontWeight("bold").setBackground("#059669").setFontColor("#FFF");
  d.getRange("I5").setValue("=D9").setFontSize(28).setFontWeight("bold").setFontColor("#059669");
  d.getRange("I6").setValue("included").setFontColor("#059669");
  d.getRange("I7").setValue("=IF(C5>0" + sep + "D9/C5" + sep + "0)").setNumberFormat("0%").setFontSize(14).setFontColor("#059669");
  d.getRange("I8").setValue("rate").setFontColor("#666");}

  // BY SOURCE
  if(SR&&FR){
  d.getRange("A11").setValue("BY SOURCE").setFontWeight("bold").setBackground("#F1F5F9");
  d.getRange("B11:D11").setBackground("#F1F5F9");
  d.getRange("A12:D12").setValues([["Source","Total","Final","%"]]).setFontWeight("bold").setBackground("#E2E8F0");
  var sources=["OpenAlex","PubMed","SemanticScholar","IEEE","Scopus","Springer"];
  for(var i=0;i<sources.length;i++){var r=13+i;
  d.getRange("A"+r).setValue(sources[i]);
  d.getRange("B"+r).setValue("=COUNTIF(SCREENED!"+SR+"2:"+SR+lr+sep+"\""+sources[i]+"\")");
  d.getRange("C"+r).setValue("=COUNTIFS(SCREENED!"+SR+"2:"+SR+lr+sep+"\""+sources[i]+"\""+sep+"SCREENED!"+FR+"2:"+FR+lr+sep+"\"INCLUDE\")");
  d.getRange("D"+r).setValue("=IF(B"+r+">0"+sep+"C"+r+"/B"+r+sep+"0)").setNumberFormat("0%");}}

  // BY YEAR
  if(YR&&FR){
  d.getRange("F11").setValue("BY YEAR").setFontWeight("bold").setBackground("#F1F5F9");
  d.getRange("G11").setBackground("#F1F5F9");
  d.getRange("F12:G12").setValues([["Year","N"]]).setFontWeight("bold").setBackground("#E2E8F0");
  for(var y=2018;y<=2025;y++){var r=13+(y-2018);d.getRange("F"+r).setValue(y);
  d.getRange("G"+r).setValue("=COUNTIFS(SCREENED!"+YR+"2:"+YR+lr+sep+y+sep+"SCREENED!"+FR+"2:"+FR+lr+sep+"\"INCLUDE\")");}}

  // BY QUALITY
  if(VQ&&FR){
  d.getRange("L11").setValue("BY QUALITY").setFontWeight("bold").setBackground("#F1F5F9");
  d.getRange("M11").setBackground("#F1F5F9");
  d.getRange("L12:M12").setValues([["Q","N"]]).setFontWeight("bold").setBackground("#E2E8F0");
  var qs=["Q1","Q2","Q3","Q4"];
  for(var i=0;i<qs.length;i++){d.getRange("L"+(13+i)).setValue(qs[i]);
  d.getRange("M"+(13+i)).setValue("=COUNTIFS(SCREENED!"+VQ+"2:"+VQ+lr+sep+"\""+qs[i]+"\""+sep+"SCREENED!"+FR+"2:"+FR+lr+sep+"\"INCLUDE\")");}}

  // BY TYPE
  if(PT&&FR){
  d.getRange("L18").setValue("BY TYPE").setFontWeight("bold").setBackground("#F1F5F9");
  d.getRange("M18").setBackground("#F1F5F9");
  d.getRange("L19:M19").setValues([["Type","N"]]).setFontWeight("bold").setBackground("#E2E8F0");
  var types=["Journal","Conference","Preprint"];
  for(var i=0;i<types.length;i++){d.getRange("L"+(20+i)).setValue(types[i]);
  d.getRange("M"+(20+i)).setValue("=COUNTIFS(SCREENED!"+PT+"2:"+PT+lr+sep+"\""+types[i]+"\""+sep+"SCREENED!"+FR+"2:"+FR+lr+sep+"\"INCLUDE\")");}}

  // KAPPA SUMMARY
  var FS2 = fc("filter_supervisor2");
  var kappaTab = ss.getSheetByName("KAPPA_RESULTS");
  if(FM && FS2 && kappaTab){
    d.getRange("I11").setValue("INTER-RATER (κ)").setFontWeight("bold").setBackground("#EEF2FF");
    d.getRange("J11:L11").setBackground("#EEF2FF");
    d.getRange("I12:L12").setValues([["Pair","κ","Level",""]]).setFontWeight("bold").setBackground("#E2E8F0");
    d.getRange("I13").setValue("You vs Sup2");
    d.getRange("J13").setValue("=KAPPA_RESULTS!B12").setNumberFormat("0.00");
    d.getRange("K13").setValue("=KAPPA_RESULTS!B13");
    if(FL){
      d.getRange("I14").setValue("You vs LLM");
      d.getRange("J14").setValue("=KAPPA_RESULTS!B25").setNumberFormat("0.00");
      d.getRange("I15").setValue("Sup2 vs LLM");
      d.getRange("J15").setValue("=KAPPA_RESULTS!B37").setNumberFormat("0.00");
    }
  }

  [50,100,50,60,60,55,100,15,80,140,15,50,50,15].forEach(function(w,i){d.setColumnWidth(i+1,w);});
  d.setTabColor("#1B2A4A");
  ss.setActiveSheet(d);ss.moveActiveSheet(1);
  Logger.log("Dashboard done");
}

// ═══════════════════════════════════════════════════════════
// SMART TAB
// ═══════════════════════════════════════════════════════════
function makeSmartTab(ss, sh, name, color, lr, lc, sep, condition, colNames, hdr) {
  var tab = ss.getSheetByName(name); if (tab) ss.deleteSheet(tab);
  tab = ss.insertSheet(name);

  var colLetters = [];
  var colHeaders = [];
  for (var c = 0; c < colNames.length; c++) {
    for (var i = 0; i < hdr.length; i++) {
      if (String(hdr[i]).trim() === colNames[c]) {
        colLetters.push(colLetter(i + 1));
        colHeaders.push(colNames[c]);
        break;
      }
    }
  }

  if (colHeaders.length === 0) {
    tab.getRange(1, 1).setValue(name).setBackground(color).setFontColor("#FFF").setFontWeight("bold");
    tab.getRange(2, 1).setValue("No matching columns in SCREENED");
    tab.setTabColor(color);
    return;
  }

  for (var c = 0; c < colHeaders.length; c++) {
    tab.getRange(1, c + 1).setValue(colHeaders[c]);
  }
  tab.getRange(1, 1, 1, colHeaders.length).setBackground(color).setFontColor("#FFF")
    .setFontWeight("bold").setFontSize(9);
  tab.setFrozenRows(1);
  tab.setTabColor(color);

  var colRefs = [];
  for (var c = 0; c < colLetters.length; c++) {
    colRefs.push("SCREENED!" + colLetters[c] + "2:" + colLetters[c] + lr);
  }

  var formula = "=IFERROR(FILTER({" + colRefs.join(sep) + "}" + sep + condition + ")" + sep + "\"No data\")";
  tab.getRange(2, 1).setValue(formula);
}

// ═══ HELPERS ═══
function colLetter(n) {
  var l = "";
  while (n > 0) { n--; l = String.fromCharCode(65 + (n % 26)) + l; n = Math.floor(n / 26); }
  return l;
}

function getSep(ss) {
  var locale = ss.getSpreadsheetLocale();
  return (locale && locale.indexOf("fr") === 0) ? ";" : ",";
}

function putCF2(sheet, cell, colL, value, lr, sep) {
  sheet.getRange(cell).setValue("=COUNTIF(SCREENED!" + colL + "2:" + colL + lr + sep + "\"" + value + "\")");
}
