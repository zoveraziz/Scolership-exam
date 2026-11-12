/**
 * দি স্টুডেন্টস ওয়েলফেয়ার ফাউন্ডেশন (The Students Welfare Foundation - SWF)
 * Google Apps Script Backend for Next.js Application
 * 
 * ফিচারসমূহ:
 * ১. অনলাইন আবেদন জমা নেওয়া
 * ২. শিক্ষার্থীর ছবি ও বিকাশ পেমেন্ট স্ক্রিনশট সরাসরি গুগল ড্রাইভে সেভ করে স্প্রেডশীটে লিংক যুক্ত করা
 * ৩. এডমিট কার্ড অনুসন্ধান ও ফলাফল (Result) অনুসন্ধান API
 * ৪. কন্টাক্ট ফরম ও অভিযোগ/পরামর্শ ডাটাবেজ
 * ৫. স্প্রেডশীট কাস্টম কালার, হেডার ডিজাইন ও ডেমো ডাটা তৈরি
 */

var DRIVE_FOLDER_NAME = "SWF_Student_Photos_2026";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🚀 মেধা বৃত্তি কন্ট্রোল")
    .addItem("🎨 সকল শিট স্বয়ংক্রিয় কালারিং ও সেটআপ (Setup Sheets)", "setupAllSheets")
    .addItem("📊 ফলাফল শিট স্বয়ংক্রিয় তৈরি (Setup Results)", "setupResultsSheet")
    .addItem("📢 নোটিশ বোর্ড শিট তৈরি (Setup Notices)", "setupNoticesSheet")
    .addItem("✍️ পরীক্ষা নিয়ন্ত্রক শিট তৈরি (Setup Controllers)", "setupControllersSheet")
    .addItem("🔒 আবেদন অনুমোদন ড্রপডাউন যুক্ত করুন (Setup Approval Dropdown)", "setupApprovalDropdown")
    .addItem("🧪 ডেমো পরীক্ষার্থী ও ফলাফল তৈরি করুন (Seed Demo Data)", "seedDemoData")
    .addToUi();
}

/**
 * বেস৬৪ (Base64) ছবি সরাসরি গুগল ড্রাইভে সেভ করার হেল্পার ফাংশন
 */
function uploadBase64ImageToDrive(base64String, fileName) {
  try {
    if (!base64String || typeof base64String !== "string" || !base64String.startsWith("data:image")) {
      return base64String || "";
    }

    var folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
    var targetFolder;
    if (folders.hasNext()) {
      targetFolder = folders.next();
    } else {
      targetFolder = DriveApp.createFolder(DRIVE_FOLDER_NAME);
    }

    // Split contentType and base64 content
    var parts = base64String.split(",");
    var meta = parts[0];
    var data = parts[1];
    var mimeType = meta.split(";")[0].replace("data:", "");

    var decodedBytes = Utilities.base64Decode(data);
    var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
    var file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return file.getUrl();
  } catch (err) {
    Logger.log("Drive upload error: " + err.toString());
    return "";
  }
}

/**
 * POST রিকোয়েস্ট হ্যান্ডলার - নতুন আবেদন ও মেসেজ জমা নেয়
 */
function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : null;
    var data = contents ? JSON.parse(contents) : {};
    var action = data.action || "register";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "contact") {
      var cSheet = ss.getSheetByName("ContactMessages") || ss.insertSheet("ContactMessages");
      if (cSheet.getLastRow() === 0) {
        cSheet.appendRow(["Timestamp", "Name (নাম)", "Phone (মোবাইল)", "Email (ইমেইল)", "Subject (বিষয়)", "Message (বার্তা)", "Status (অবস্থা)"]);
        cSheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#d1fae5").setFontColor("#065f46");
      }
      cSheet.appendRow([
        new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
        data.name || "",
        data.phone || "",
        data.email || "",
        data.subject || "",
        data.message || "",
        "নতুন বার্তা"
      ]);
      return createJsonResponse({ success: true, message: "বার্তা সফলভাবে পাঠানো হয়েছে!" });
    }

    // Default: Student Registration
    var sheet = ss.getSheetByName("Submissions") || ss.insertSheet("Submissions");
    if (sheet.getLastRow() === 0) {
      setupSubmissionsHeader(sheet);
    }

    var regNo = data.regNo || ("SWF-2026-" + Math.floor(100000 + Math.random() * 900000));
    var rollNumber = data.rollNumber || (10000 + sheet.getLastRow()).toString();

    // শিক্ষার্থীর পাসপোর্ট সাইজ ছবি ও পেমেন্টের স্ক্রিনশট সরাসরি গুগল ড্রাইভে সেভ
    var photoUrl = "";
    if (data.photoUrl) {
      photoUrl = uploadBase64ImageToDrive(data.photoUrl, regNo + "_photo.jpg");
    }

    var payShotUrl = "";
    if (data.payShotUrl) {
      payShotUrl = uploadBase64ImageToDrive(data.payShotUrl, regNo + "_payment.jpg");
    }

    sheet.appendRow([
      data.timestamp || new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
      regNo,
      rollNumber,
      data.name || "",
      data.fatherName || "",
      data.motherName || "",
      data.dob || "",
      data.gender === "female" ? "ছাত্রী" : "ছাত্র",
      data.institution || "",
      data.studentClass || "",
      data.principalPhone || "",
      data.guardianPhone || "",
      data.email || "",
      data.senderBkash || "",
      payShotUrl || "পেমেন্ট প্রমাণপত্র সংরক্ষিত",
      photoUrl || "ছবি সংরক্ষিত",
      "বি.এ.এফ শাহীন কলেজ কেন্দ্র, ঢাকা",
      "১৫ নভেম্বর ২০২৬ (সকাল ১০:০০ টা)",
      "পেন্ডিং"
    ]);

    return createJsonResponse({
      success: true,
      message: "আপনার আবেদন সফলভাবে জমা হয়েছে!",
      status: "pending",
      regNo: regNo,
      rollNumber: rollNumber,
      photoUrl: photoUrl,
      payShotUrl: payShotUrl,
      examCenter: "বি.এ.এফ শাহীন কলেজ কেন্দ্র, ঢাকা",
      examDate: "১৫ নভেম্বর ২০২৬ (সকাল ১০:০০ টা)"
    });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * GET রিকোয়েস্ট হ্যান্ডলার - এডমিট কার্ড, ফলাফল এবং সাধারণ তথ্য প্রদান
 */
function doGet(e) {
  try {
    var params = e.parameter || {};
    var action = params.action || "ping";
    var query = (params.id || params.query || "").toString().trim().toUpperCase();
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Health check
    if (action === "ping") {
      return createJsonResponse({ success: true, message: "SWF Google Apps Script API is active!", timestamp: new Date().toISOString() });
    }

    // 2. Search Admit Card
    if (action === "getAdmitCard") {
      var sheet = ss.getSheetByName("Submissions");
      if (!sheet || sheet.getLastRow() <= 1) {
        return createJsonResponse({ success: false, message: "কোনো পরীক্ষার্থীর তথ্য পাওয়া যায়নি।" });
      }

      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var rRegNo = String(row[1]).trim().toUpperCase();
        var rRoll = String(row[2]).trim().toUpperCase();

        if (rRegNo === query || rRoll === query) {
          var rawStatus = String(row[18] || "পেন্ডিং").trim();
          var appStatus = rawStatus.toLowerCase();

          if (appStatus === "বাতিল" || appStatus === "cancelled" || appStatus === "rejected") {
            return createJsonResponse({
              success: false,
              found: true,
              status: "cancelled",
              message: "পেমেন্ট জটিলতা বা তথ্যের অমিলের কারণে আবেদনটি বাতিল বা স্থগিত করা হয়েছে। বিস্তারিত জানতে কেন্দ্রীয় হেল্পলাইনে যোগাযোগ করুন।"
            });
          }

          if (appStatus === "পেন্ডিং" || appStatus === "pending" || appStatus === "") {
            return createJsonResponse({
              success: false,
              found: true,
              status: "pending",
              message: "আপনার আবেদন ও বিকাশ পেমেন্ট যাচাইকরণ প্রক্রিয়াধীন রয়েছে। কর্তৃপক্ষ অনুমোদন করার পর প্রবেশপত্র ডাউনলোড করা যাবে।"
            });
          }

          // সংশ্লিষ্ট পরীক্ষা নিয়ন্ত্রক ও স্বাক্ষর নির্ধারণ (Controllers শিট থেকে)
          var controllerInfo = getControllerForRoll(ss, row[2] || "১০৫২৪");

          // অনুমোদিত (Approved)
          return createJsonResponse({
            success: true,
            found: true,
            status: "approved",
            data: {
              regNo: row[1],
              rollNumber: row[2] || "১০৫২৪",
              name: row[3],
              fatherName: row[4],
              motherName: row[5],
              dob: row[6],
              gender: row[7],
              institution: row[8],
              studentClass: row[9],
              examCenter: row[16] || "বি.এ.এফ শাহীন কলেজ কেন্দ্র, ঢাকা",
              examDate: row[17] || "১৫ নভেম্বর ২০২৬",
              examTime: "সকাল ১০:০০ টা",
              photoUrl: String(row[15]).startsWith("http") ? row[15] : "",
              controllerName: controllerInfo.name,
              controllerDesignation: controllerInfo.designation,
              controllerSignature: controllerInfo.signature,
              controllerPhone: controllerInfo.phone
            }
          });
        }
      }
      return createJsonResponse({ success: false, found: false, message: "প্রদত্ত রেজিস্ট্রেশন বা রোল নম্বরে কোনো প্রবেশপত্র পাওয়া যায়নি।" });
    }

    // 3. Search Result
    if (action === "getResult") {
      var rSheet = ss.getSheetByName("Results");
      if (!rSheet || rSheet.getLastRow() <= 1) {
        return createJsonResponse({ success: false, message: "ফলাফলের তথ্য এখনো আপলোড করা হয়নি।" });
      }

      var resRows = rSheet.getDataRange().getValues();
      for (var j = 1; j < resRows.length; j++) {
        var r = resRows[j];
        var resReg = String(r[0]).trim().toUpperCase();
        var resRoll = String(r[1]).trim().toUpperCase();

        if (resReg === query || resRoll === query) {
          var controllerInfo = getControllerForRoll(ss, r[1] || query || "১০৫২৪");
          return createJsonResponse({
            success: true,
            found: true,
            data: {
              regNo: r[0],
              rollNumber: r[1],
              name: r[2],
              studentClass: r[3],
              institution: r[4],
              totalMarks: 100,
              obtainedMarks: Number(r[9]) || 88,
              gpa: r[10] || "5.00",
              meritPosition: Number(r[11]) || 1,
              scholarshipCategory: r[12] || "ট্যালেন্টপুল বৃত্তি",
              status: r[13] || "উত্তীর্ণ",
              controllerName: controllerInfo.name,
              controllerDesignation: controllerInfo.designation,
              controllerSignature: controllerInfo.signature,
              controllerPhone: controllerInfo.phone,
              subjects: [
                { name: "বাংলা", marks: Number(r[5]) || 23, total: 25 },
                { name: "ইংরেজি", marks: Number(r[6]) || 22, total: 25 },
                { name: "গণিত", marks: Number(r[7]) || 25, total: 30 },
                { name: "বিজ্ঞান ও সাধারণ জ্ঞান", marks: Number(r[8]) || 18, total: 20 }
              ]
            }
          });
        }
      }
      return createJsonResponse({ success: false, found: false, message: "প্রদত্ত নম্বরে কোনো ফলাফল খুঁজে পাওয়া যায়নি।" });
    }

    // 4. Controller & Signature Lookup (সরাসরি পরীক্ষা নিয়ন্ত্রকের স্বাক্ষর ও নাম খোঁজা)
    if (action === "getControllers" || action === "getController") {
      var rollVal = params.roll || params.id || query || "10524";
      var ctrlData = getControllerForRoll(ss, rollVal);
      return createJsonResponse({ success: true, found: true, data: ctrlData });
    }

    // 4. Get Committee & Advisors List (উপদেষ্টা ও পরিচালনা পরিষদ)
    if (action === "getCommittee") {
      var commSheet = ss.getSheetByName("Committee") || ss.getSheetByName("পরিচালনা_পরিষদ");
      if (!commSheet || commSheet.getLastRow() <= 1) {
        commSheet = setupCommitteeSheet(ss);
      }

      var cRows = commSheet.getDataRange().getValues();
      var members = [];
      for (var c = 1; c < cRows.length; c++) {
        var crow = cRows[c];
        if (crow[1] && String(crow[1]).trim() !== "") {
          members.push({
            id: "comm-" + c,
            order: Number(crow[0]) || c,
            name: String(crow[1]).trim(),
            role: String(crow[2]).trim(),
            designation: String(crow[3] || "").trim(),
            photo: String(crow[4] || "").trim()
          });
        }
      }
      return createJsonResponse({ success: true, count: members.length, data: members });
    }

    // 5. Get Rules & Syllabus (পরীক্ষার নিয়মাবলী ও সিলেবাস)
    if (action === "getRulesAndSyllabus" || action === "getRules" || action === "getSyllabus") {
      // 5.1 Rules
      var rulesSheet = ss.getSheetByName("Rules") || ss.getSheetByName("নিয়মাবলী");
      if (!rulesSheet || rulesSheet.getLastRow() <= 1) {
        rulesSheet = setupRulesSheet(ss);
      }
      var ruleRows = rulesSheet.getDataRange().getValues();
      var rulesList = [];
      for (var r = 1; r < ruleRows.length; r++) {
        var rText = String(ruleRows[r][1] || "").trim();
        var rStatus = String(ruleRows[r][2] || "Active").trim().toLowerCase();
        if (rText && rStatus !== "inactive" && rStatus !== "বন্ধ") {
          rulesList.push(rText);
        }
      }

      // 5.2 Syllabus
      var sylSheet = ss.getSheetByName("Syllabus") || ss.getSheetByName("সিলেবাস");
      if (!sylSheet || sylSheet.getLastRow() <= 1) {
        sylSheet = setupSyllabusSheet(ss);
      }
      var sylRows = sylSheet.getDataRange().getValues();
      var classMap = {};
      var classOrder = [];

      for (var s = 1; s < sylRows.length; s++) {
        var row = sylRows[s];
        var sClass = String(row[0] || "").trim();
        var sSubject = String(row[1] || "").trim();
        var sTopics = String(row[2] || "").trim();
        var sMarks = Number(row[3]) || 0;
        var sDuration = String(row[4] || "২ ঘণ্টা").trim();

        if (sClass && sSubject) {
          if (!classMap[sClass]) {
            classMap[sClass] = {
              id: "syl-" + (classOrder.length + 1),
              studentClass: sClass,
              examDuration: sDuration,
              subjects: [],
              totalMarks: 0
            };
            classOrder.push(sClass);
          }
          classMap[sClass].subjects.push({
            name: sSubject,
            topics: sTopics,
            marks: sMarks
          });
          classMap[sClass].totalMarks += sMarks;
          if (sDuration) {
            classMap[sClass].examDuration = sDuration;
          }
        }
      }

      var syllabusList = [];
      for (var co = 0; co < classOrder.length; co++) {
        syllabusList.push(classMap[classOrder[co]]);
      }

      return createJsonResponse({
        success: true,
        rules: rulesList,
        syllabus: syllabusList
      });
    }

    // 6. Get Dignitaries' Messages (গুণীজন ও প্রতিষ্ঠান প্রধানদের বাণী)
    if (action === "getMessages" || action === "বাণী") {
      var msgSheet = ss.getSheetByName("Messages") || ss.getSheetByName("বাণী");
      if (!msgSheet || msgSheet.getLastRow() <= 1) {
        msgSheet = setupMessagesSheet(ss);
      }

      var mRows = msgSheet.getDataRange().getValues();
      var messageList = [];
      for (var m = 1; m < mRows.length; m++) {
        var mRow = mRows[m];
        var mName = String(mRow[1] || "").trim();
        var mRole = String(mRow[2] || "").trim();
        var mText = String(mRow[3] || "").trim();
        var mPhoto = String(mRow[4] || "").trim();
        var mStatus = String(mRow[5] || "Active").trim().toLowerCase();

        if (mText && mStatus !== "inactive" && mStatus !== "বন্ধ") {
          messageList.push({
            id: "msg-" + m,
            name: mName || "শ্রদ্ধেয় গুণীজন",
            role: mRole || "শিক্ষা অনুরাগী",
            text: mText,
            photo: mPhoto
          });
        }
      }

      return createJsonResponse({
        success: true,
        count: messageList.length,
        data: messageList
      });
    }

    // 7. Get Notices (সর্বশেষ নোটিশ বোর্ড ও ঘোষণা)
    if (action === "getNotices" || action === "notices" || action === "নোটিশ") {
      var notSheet = ss.getSheetByName("Notices") || ss.getSheetByName("নোটিশ");
      if (!notSheet || notSheet.getLastRow() <= 1) {
        notSheet = setupNoticesSheet(ss);
      }

      var nRows = notSheet.getDataRange().getValues();
      var noticeList = [];
      for (var n = 1; n < nRows.length; n++) {
        var nRow = nRows[n];
        var nDate = String(nRow[1] || "").trim();
        var nTitle = String(nRow[2] || "").trim();
        var nCat = String(nRow[3] || "সাধারণ").trim();
        var nContent = String(nRow[4] || "").trim();
        var nIsImpRaw = String(nRow[5] || "").trim().toLowerCase();
        var nFileUrl = String(nRow[6] || "").trim();
        var nStatus = String(nRow[7] || "Active").trim().toLowerCase();

        var isImp =
          nIsImpRaw === "হ্যাঁ" ||
          nIsImpRaw === "জরুরি" ||
          nIsImpRaw === "জরুরী" ||
          nIsImpRaw === "true" ||
          nIsImpRaw === "yes";

        if (nTitle && nStatus !== "inactive" && nStatus !== "বন্ধ") {
          noticeList.push({
            id: "notice-" + n,
            date: nDate || "আজ",
            title: nTitle,
            category: nCat || "সাধারণ",
            content: nContent,
            isImportant: isImp,
            fileUrl: nFileUrl
          });
        }
      }

      return createJsonResponse({
        success: true,
        count: noticeList.length,
        data: noticeList
      });
    }

    // 8. Get Settings (সাইট নাম, হেল্পলাইন, বিকাশ নম্বর ইত্যাদি)
    if (action === "getSettings" || action === "settings" || action === "সেটিংস") {
      var setSheet = ss.getSheetByName("Settings") || ss.getSheetByName("সেটিংস");
      var settingsMap = {};
      if (setSheet && setSheet.getLastRow() >= 2) {
        var sRows = setSheet.getDataRange().getValues();
        for (var s = 1; s < sRows.length; s++) {
          var k = String(sRows[s][0] || "").trim();
          var v = String(sRows[s][1] || "").trim();
          if (k) {
            settingsMap[k] = v;
          }
        }
      }

      // Live Submissions কাউন্ট
      var subSheet = ss.getSheetByName("Submissions");
      var liveApplicantCount = 0;
      if (subSheet && subSheet.getLastRow() > 1) {
        liveApplicantCount = subSheet.getLastRow() - 1;
      }
      if (!settingsMap["ApplicantCount"]) {
        settingsMap["ApplicantCount"] = liveApplicantCount.toString();
      }
      settingsMap["LiveSubmissionsCount"] = liveApplicantCount.toString();

      return createJsonResponse({
        success: true,
        data: settingsMap,
        liveApplicantCount: liveApplicantCount
      });
    }

    // 9. Get Live Stats (মোট আবেদনকারীর সংখ্যা)
    if (action === "getStats" || action === "stats" || action === "applicantCount") {
      var subSheetStat = ss.getSheetByName("Submissions");
      var totalSubs = 0;
      if (subSheetStat && subSheetStat.getLastRow() > 1) {
        totalSubs = subSheetStat.getLastRow() - 1;
      }
      return createJsonResponse({
        success: true,
        applicantCount: totalSubs
      });
    }

    return createJsonResponse({ success: false, message: "অজানা অ্যাকশন অনুরোধ।" });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * JSON রেসপন্স বিল্ডার
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * শিট হেডার সেটআপ ও ড্রপডাউন ভ্যালিডেশন
 */
function setupSubmissionsHeader(sheet) {
  if (sheet.getLastRow() <= 1) {
    sheet.clear();
    var headers = [
      "Timestamp", "Reg No (রেজিঃ নম্বর)", "Roll No (রোল নম্বর)", "Student Name (নাম)",
      "Father's Name (পিতা)", "Mother's Name (মাতা)", "Date of Birth (জন্ম তারিখ)", "Gender (লিঙ্গ)",
      "Institution (প্রতিষ্ঠান)", "Class (শ্রেণী)", "Principal Phone (প্রধান শিক্ষক ফোন)",
      "Guardian Phone (অভিভাবক ফোন)", "Email (ইমেইল)", "Sender bKash (প্রেরক বিকাশ)",
      "Payment Shot Drive Link (পেমেন্ট লিংক)", "Student Photo Drive Link (ছবি লিংক)", "Exam Center (পরীক্ষা কেন্দ্র)",
      "Exam Date & Time (তারিখ ও সময়)", "Status (অনুমোদন অবস্থা)"
    ];
    sheet.appendRow(headers);
    var range = sheet.getRange(1, 1, 1, headers.length);
    range.setFontWeight("bold");
    range.setBackground("#065f46");
    range.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }

  // ড্রপডাউন ও কালার কোডিং সক্রিয় করা
  setupApprovalDropdown();
}

/**
 * শুধুমাত্র Submissions শিটে অনুমোদন ড্রপডাউন ও কালার কোডিং যুক্ত করা
 */
function setupApprovalDropdown() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Submissions");
  if (!sheet) return;

  var s1 = sheet.getRange("S1");
  if (!s1.getValue()) {
    s1.setValue("Status (অনুমোদন অবস্থা)");
    s1.setFontWeight("bold").setBackground("#065f46").setFontColor("#ffffff");
  }

  var range = sheet.getRange("S2:S1000");

  // ড্রপডাউন ভ্যালিডেশন
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["অনুমোদিত", "পেন্ডিং", "বাতিল"], true)
    .setAllowInvalid(false)
    .build();
  range.setDataValidation(statusRule);

  // অটোম্যাটিক কালার কোডিং (অনুমোদিত=সবুজ, পেন্ডিং=হলুদ, বাতিল=লাল)
  var rules = sheet.getConditionalFormatRules();
  var ruleGreen = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("অনুমোদিত")
    .setBackground("#dcfce7")
    .setFontColor("#15803d")
    .setRanges([range])
    .build();

  var ruleYellow = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("পেন্ডিং")
    .setBackground("#fef3c7")
    .setFontColor("#b45309")
    .setRanges([range])
    .build();

  var ruleRed = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("বাতিল")
    .setBackground("#fee2e2")
    .setFontColor("#b91c1c")
    .setRanges([range])
    .build();

  rules.push(ruleGreen, ruleYellow, ruleRed);
  sheet.setConditionalFormatRules(rules);

  SpreadsheetApp.getActiveSpreadsheet().toast("অনুমোদন ড্রপডাউন (অনুমোদিত, পেন্ডিং, বাতিল) ও কালার কোডিং সফলভাবে যুক্ত হয়েছে!", "সফল", 5);
}

/**
 * রোল নম্বর রেঞ্জ অনুযায়ী সংশ্লিষ্ট পরীক্ষা নিয়ন্ত্রকের তথ্য বের করা
 */
function getControllerForRoll(ss, rawRoll) {
  var rollStr = String(rawRoll || "").trim();
  var bnDigits = { "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9" };
  var normRoll = parseInt(rollStr.replace(/[০-৯]/g, function(d) { return bnDigits[d] || d; }).replace(/\D/g, ""), 10) || 0;

  var possibleNames = ["Controllers", "নিয়ন্ত্রক", "নিয়ন্ত্রকগণ", "Signatures", "স্বাক্ষর", "Controller", "পরীক্ষা নিয়ন্ত্রক", "Signatory"];
  var sheet = null;
  for (var p = 0; p < possibleNames.length; p++) {
    sheet = ss.getSheetByName(possibleNames[p]);
    if (sheet && sheet.getLastRow() > 1) break;
  }

  // যদি উল্লেখিত নামে না পাওয়া যায়, তবে অন্য কোনো শিটে শুরু রোল/স্বাক্ষর হেডার আছে কিনা খোঁজা
  if (!sheet || sheet.getLastRow() <= 1) {
    var allSheets = ss.getSheets();
    for (var s = 0; s < allSheets.length; s++) {
      var sh = allSheets[s];
      var sName = sh.getName();
      if (sName !== "Submissions" && sName !== "Results" && sName !== "Settings" && sName !== "ContactMessages" && sName !== "Rules" && sName !== "Syllabus") {
        if (sh.getLastRow() > 1) {
          var hRow = sh.getRange(1, 1, 1, Math.min(sh.getLastColumn(), 8)).getValues()[0];
          var hText = hRow.join(" ").toLowerCase();
          if (hText.indexOf("রোল") > -1 || hText.indexOf("roll") > -1 || hText.indexOf("স্বাক্ষর") > -1 || hText.indexOf("sign") > -1) {
            sheet = sh;
            break;
          }
        }
      }
    }
  }

  if (!sheet || sheet.getLastRow() <= 1) {
    return {
      name: "আব্দুল আজিজ",
      designation: "পরীক্ষা নিয়ন্ত্রক",
      signature: "",
      phone: "01721838990"
    };
  }

  var cRows = sheet.getDataRange().getValues();
  var hCols = cRows[0] || [];
  var startCol = 0, endCol = 1, nameCol = 2, signCol = 3, phoneCol = 4;

  // হেডার নাম বিশ্লেষণ করে কলাম স্বয়ংক্রিয়ভাবে শনাক্তকরণ
  for (var h = 0; h < hCols.length; h++) {
    var val = String(hCols[h] || "").toLowerCase();
    if (val.indexOf("শুরু") > -1 || val.indexOf("start") > -1) startCol = h;
    else if (val.indexOf("শেষ") > -1 || val.indexOf("end") > -1) endCol = h;
    else if (val.indexOf("নাম") > -1 || val.indexOf("name") > -1) nameCol = h;
    else if (val.indexOf("স্বাক্ষর") > -1 || val.indexOf("sign") > -1 || val.indexOf("photo") > -1) signCol = h;
    else if (val.indexOf("ফোন") > -1 || val.indexOf("phone") > -1 || val.indexOf("mobile") > -1 || val.indexOf("মোবাইল") > -1) phoneCol = h;
  }

  for (var c = 1; c < cRows.length; c++) {
    var r = cRows[c];
    var startStr = String(r[startCol] || "").replace(/[০-৯]/g, function(d) { return bnDigits[d] || d; }).replace(/\D/g, "");
    var endStr = String(r[endCol] || "").replace(/[০-৯]/g, function(d) { return bnDigits[d] || d; }).replace(/\D/g, "");
    var startNum = parseInt(startStr, 10) || 0;
    var endNum = parseInt(endStr, 10) || 9999999;

    if (normRoll >= startNum && normRoll <= endNum) {
      return {
        name: String(r[nameCol] || "").trim() || "আব্দুল আজিজ",
        designation: "পরীক্ষা নিয়ন্ত্রক",
        signature: String(r[signCol] || "").trim(),
        phone: String(r[phoneCol] || "").trim()
      };
    }
  }

  // কোনো রেঞ্জে হুবহু না মিললে প্রথম সারিটি প্রদান করা
  if (cRows.length > 1 && cRows[1][nameCol]) {
    return {
      name: String(cRows[1][nameCol] || "").trim() || "আব্দুল আজিজ",
      designation: "পরীক্ষা নিয়ন্ত্রক",
      signature: String(cRows[1][signCol] || "").trim(),
      phone: String(cRows[1][phoneCol] || "").trim()
    };
  }

  return {
    name: "আব্দুল আজিজ",
    designation: "পরীক্ষা নিয়ন্ত্রক",
    signature: "",
    phone: "01721838990"
  };
}

/**
 * পরীক্ষা নিয়ন্ত্রক ও স্বাক্ষর শিট প্রস্তুতকরণ
 */
function setupControllersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Controllers") || ss.insertSheet("Controllers");
  if (sheet.getLastRow() <= 1) {
    sheet.clear();
    var headers = [
      "Start Roll (শুরু রোল)", "End Roll (শেষ রোল)", "Controller Name (নিয়ন্ত্রকের নাম ও পদবী)",
      "Signature Drive Link (স্বাক্ষরের ড্রাইভ লিংক)", "Phone (মোবাইল নম্বর)"
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1e3a8a").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
    sheet.appendRow(["10001", "10100", "অধ্যাপক আহমদ উল্লাহ, পরীক্ষা নিয়ন্ত্রক", "", "01711000000"]);
    sheet.appendRow(["10101", "10200", "অধ্যক্ষ মো: রফিকুল ইসলাম, উপ-পরীক্ষা নিয়ন্ত্রক", "", "01811000000"]);
    sheet.appendRow(["10201", "10300", "জনাব মাহফুজুর রহমান, সহকারী পরীক্ষা নিয়ন্ত্রক", "", "01911000000"]);
  }
  SpreadsheetApp.getActiveSpreadsheet().toast("Controllers শিট সফলভাবে প্রস্তুত করা হয়েছে!", "সফল", 5);
  return sheet;
}

/**
 * ফলাফল (Results) শিট স্বয়ংক্রিয়ভাবে তৈরি ও ড্রপডাউন ভ্যালিডেশন
 */
function setupResultsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Results") || ss.insertSheet("Results");

  if (sheet.getLastRow() <= 1) {
    sheet.clear();
    var headers = [
      "Reg No (রেজিঃ নম্বর)", "Roll No (রোল নম্বর)", "Student Name (নাম)", "Class (শ্রেণী)", "Institution (প্রতিষ্ঠান)",
      "Bangla (বাংলা-২৫)", "English (ইংরেজি-২৫)", "Math (গণিত-৩০)", "Science & GK (বিজ্ঞান-২০)",
      "Total Marks (মোট-১০০)", "GPA / Grade (গ্রেড)", "Merit Rank (মেধা স্থান)", "Scholarship Category (বৃত্তি ক্যাটাগরি)", "Status (অবস্থা)"
    ];
    sheet.appendRow(headers);
    var range = sheet.getRange(1, 1, 1, headers.length);
    range.setFontWeight("bold").setBackground("#047857").setFontColor("#ffffff");
    sheet.setFrozenRows(1);

    // বৃত্তি ক্যাটাগরি ড্রপডাউন (কলাম M / কলাম 13)
    var catRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["ট্যালেন্টপুল বৃত্তি", "সাধারণ গ্রেড বৃত্তি", "বিশেষ মেধা স্বীকৃতি", "উত্তীর্ণ", "মেধা তালিকা"], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange("M2:M1000").setDataValidation(catRule);

    // স্ট্যাটাস ড্রপডাউন (কলাম N / কলাম 14)
    var statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["উত্তীর্ণ", "অনুত্তীর্ণ", "অনুপস্থিত"], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange("N2:N1000").setDataValidation(statusRule);

    // ১টি ডেমো নমুনা সারি যুক্ত করা
    sheet.appendRow([
      "SWF-2026-849201", "10524", "আব্দুর রহমান", "৫ম শ্রেণী", "গভর্নメント ল্যাবরেটরী হাই স্কুল",
      24, 23, 29, 19, 95, "5.00", 1, "ট্যালেন্টপুল বৃত্তি", "উত্তীর্ণ"
    ]);
  }
  SpreadsheetApp.getActiveSpreadsheet().toast("Results শিট সফলভাবে প্রস্তুত করা হয়েছে!", "সফল", 5);
  return sheet;
}

/**
 * সম্পূর্ণ স্প্রেডশীট প্রফেশনাল ডিজাইনে সাজানো
 */
function setupAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Submissions Sheet
  var subSheet = ss.getSheetByName("Submissions") || ss.insertSheet("Submissions");
  setupSubmissionsHeader(subSheet);

  // 2. Results Sheet
  setupResultsSheet();

  // 3. Contact Messages Sheet
  var conSheet = ss.getSheetByName("ContactMessages") || ss.insertSheet("ContactMessages");
  conSheet.clear();
  var conHeaders = ["Timestamp", "Name", "Phone", "Email", "Subject", "Message", "Status"];
  conSheet.appendRow(conHeaders);
  conSheet.getRange(1, 1, 1, conHeaders.length).setFontWeight("bold").setBackground("#0f766e").setFontColor("#ffffff");
  conSheet.setFrozenRows(1);

  // 4. Settings Sheet
  var setSheet = ss.getSheetByName("Settings") || ss.insertSheet("Settings");
  if (setSheet.getLastRow() <= 1) {
    setSheet.clear();
    setSheet.appendRow(["Setting Key", "Setting Value", "Description"]);
    setSheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#334155").setFontColor("#ffffff");
    var settings = [
      ["SiteName", "রেজাউল হাসান কয়েস লোদী বৃত্তি পরীক্ষা", "ওয়েবসাইটের শিরোনাম ও লোগো নাম"],
      ["SiteTagline", "শিক্ষা সেবা ও মূল্যায়ন কর্মসূচি", "লোগোর নিচে ছোট স্লোগান বা ট্যাগলাইন"],
      ["MarqueeNotice", "📢 বৃত্তি পরীক্ষা ২০২৬ এর অনলাইন রেজিস্ট্রেশন কার্যক্রম পুরোদমে চলছে। ৪র্থ থেকে ৮ম শ্রেণীর সকল শিক্ষার্থীকে দ্রুত ফর্ম পূরণের জন্য অনুরোধ করা হচ্ছে।", "হলুদ বারে ডান থেকে বামে চলমান বিশেষ নোটিশ লেখা"],
      ["HeroBadge", "মেধা মূল্যায়ন ও বৃত্তি পরীক্ষা ২০২৬", "ব্যানারের ওপরের ছোট ব্যাজ"],
      ["HeroTitle", "বৃত্তি পরীক্ষা ২০২৬ এর অনলাইন রেজিস্ট্রেশন চলছে", "ব্যানারের প্রধান বড় শিরোনাম"],
      ["HeroSubtitle", "প্রাথমিক ও মাধ্যমিক স্তরের (৪র্থ থেকে ৮ম শ্রেণী) শিক্ষার্থীদের সুপ্ত মেধা বিকাশ, শিক্ষা সহায়তা এবং উৎসাহ প্রদানের লক্ষ্যে প্রতি বছরের ন্যায় এবারও বর্ণাঢ্য মেধা বৃত্তি পরীক্ষার আয়োজন করা হয়েছে।", "ব্যানারের নিচের বিস্তারিত বর্ণনা"],
      ["HeroTitleSize", "বড়", "মূল শিরোনামের ফন্ট সাইজ (বড় / মাঝারি / ছোট / 50px)"],
      ["HeroSubtitleSize", "মাঝারি", "বিস্তারিত লেখার ফন্ট সাইজ (মাঝারি / ছোট / 20px)"],
      ["HeroBadgeSize", "ছোট", "ওপরের গোল ব্যাজের সাইজ"],
      ["bKashNumber", "01721838990", "রেজিস্ট্রেশন ফি গ্রহণের বিকাশ নম্বর"],
      ["RegistrationFee", "২০০", "রেজিস্ট্রেশন ফি (টাকা)"],
      ["Hotline", "০১৯৭৯৫১৩৯৯০", "প্রধান হেল্পলাইন নম্বর"],
      ["AlternativePhone", "০১৭২১৮৩৮৯৯০", "বিকল্প মোবাইল বা জরুরি নম্বর (ঐচ্ছিক)"],
      ["Email", "swfdhaka@gmail.com", "অফিসিয়াল ইমেইল"],
      ["ExamDate", "১৫ নভেম্বর ২০২৬", "পরীক্ষার তারিখ"],
      ["ApplicationDeadline", "৩১ আগস্ট ২০২৬", "আবেদনের শেষ সময় (এই তারিখের পর এডমিট কার্ড ডাউনলোড শুরু হবে)"],
      ["AdmitCardStatus", "স্বয়ংক্রিয়", "এডমিট কার্ড ডাউনলোড অবস্থা (স্বয়ংক্রিয় / চালু / বন্ধ)"],
      ["ExamCenterDefault", "বি.এ.এফ শাহীন কলেজ কেন্দ্র, ঢাকা", "ডিফল্ট পরীক্ষা কেন্দ্র"],
      ["ContactTitle", "যোগাযোগের ঠিকানা ও তথ্য", "যোগাযোগ পেজের প্রধান শিরোনাম"],
      ["ContactSubtitle", "যেকোনো জিজ্ঞাসা বা পরামর্শের জন্য আমাদের সাথে যোগাযোগ করুন।", "যোগাযোগ পেজের বিবরণ"],
      ["OfficeAddress", "আমতলী, মহাখালী, ঢাকা-১২০৬, বাংলাদেশ।", "কেন্দ্রীয় কার্যালয়ের পূর্ণ ঠিকানা"],
      ["OfficeHours", "সকাল ৯:০০ টা - বিকাল ৫:০০ টা (শুক্রবার বন্ধ)", "অফিসের কাজের সময়সূচী"],
      ["ContactNotice", "বিশেষ ঘোষণা: পরীক্ষার হল বা এডমিট কার্ড সংক্রান্ত সহায়তার জন্য সকাল ১০টা থেকে বিকাল ৪টার মধ্যে কল করুন।", "যোগাযোগ পেজের বিশেষ নোটিশ বা ঘোষণা"],
      ["ContactExtraInfo", "অতিরিক্ত কোনো দিকনির্দেশনা, বাসের রুট বা যাতায়াতের তথ্য।", "যোগাযোগ পেজের অতিরিক্ত বিস্তারিত তথ্য বা দিকনির্দেশনা"]
    ];
    for (var k = 0; k < settings.length; k++) {
      setSheet.appendRow(settings[k]);
    }
    setSheet.setFrozenRows(1);
  }

  // 5. Committee Sheet (উপদেষ্টা ও পরিচালনা পরিষদ)
  setupCommitteeSheet(ss);

  // 6. Rules Sheet (পরীক্ষার নিয়মাবলী)
  setupRulesSheet(ss);

  // 7. Syllabus Sheet (শ্রেণীভিত্তিক সিলেবাস ও মানবন্টন)
  setupSyllabusSheet(ss);

  // 8. Messages Sheet (গুণীজন ও প্রতিষ্ঠান প্রধানদের বাণী)
  setupMessagesSheet(ss);

  // 9. Notices Sheet (সর্বশেষ নোটিশ বোর্ড ও ঘোষণা)
  setupNoticesSheet(ss);

  SpreadsheetApp.getActiveSpreadsheet().toast("সকল ৯টি শিট সফলভাবে প্রস্তুত ও কালারিং করা হয়েছে!", "সফল", 5);
}

/**
 * নোটিশ বোর্ড শিট তৈরি ও ডিফল্ট নোটিশ লোড
 */
function setupNoticesSheet(ss) {
  var sheet = ss.getSheetByName("Notices") || ss.insertSheet("Notices");
  sheet.clear();
  var headers = [
    "SL (ক্রম)",
    "Date (তারিখ)",
    "Title (শিরোনাম)",
    "Category (ক্যাটাগরি)",
    "Content (বিস্তারিত বিবরণ)",
    "IsImportant (জরুরি)",
    "FileUrl (ফাইল বা ড্রাইভ লিংক)",
    "Status (অবস্থা)"
  ];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0f766e").setFontColor("#ffffff");
  sheet.setFrozenRows(1);

  var defaultNotices = [
    [
      1,
      "১৪ জুলাই ২০২৬",
      "বৃত্তি পরীক্ষা ২০২৬ এর অনলাইন ফরম পূরণের সময়সীমা ঘোষণা",
      "রেজিস্ট্রেশন",
      "দি স্টুডেন্টস ওয়েলফেয়ার ফাউন্ডেশন কর্তৃক আয়োজিত বৃত্তি পরীক্ষা ২০২৬ এর অনলাইন রেজিস্ট্রেশন শুরু হয়েছে। আগামী ৩১ আগস্ট ২০২৬ পর্যন্ত শিক্ষার্থীরা কোনো বিলম্ব ফি ছাড়াই আবেদন করতে পারবে।",
      "জরুরি",
      "",
      "Active"
    ],
    [
      2,
      "১০ জুন ২০২৬",
      "শ্রেণী ভিত্তিক সিলেবাস ও মানবন্টন প্রকাশিত হয়েছে",
      "সিলেবাস",
      "৪র্থ থেকে ৮ম শ্রেণীর জন্য পরীক্ষা উপযোগী বিশেষ সংক্ষিপ্ত সিলেবাস ও ১০০ নম্বরের প্রশ্নের মানবন্টন প্রকাশ করা হয়েছে। নিয়মাবলী ও সিলেবাস অপশনে বিস্তারিত দেখুন।",
      "জরুরি",
      "",
      "Active"
    ],
    [
      3,
      "০১ জুন ২০২৬",
      "বৃত্তি পরীক্ষা ২০২৬ এর সময়সূচি ও পরীক্ষা কেন্দ্র সংক্রান্ত নির্দেশিকা",
      "পরীক্ষা",
      "বৃত্তি পরীক্ষা ২০২৬ আগামী ২০ নভেম্বর ২০২৬ রোজ শুক্রবার সকাল ১০:০০ টা থেকে শুরু হবে। শিক্ষার্থীদের পরীক্ষার ৩০ মিনিট পূর্বে কেন্দ্রে উপস্থিত হতে হবে।",
      "সাধারণ",
      "",
      "Active"
    ],
    [
      4,
      "২৫ মে ২০২৬",
      "মেধা বৃত্তি প্রাপ্তদের এককালীন অনুদান ও সার্টিফিকেট বিতরণ নীতি",
      "সাধারণ",
      "ট্যালেন্টপুল ও সাধারণ গ্রেডে বৃত্তিপ্রাপ্ত সকল শিক্ষার্থীকে নগদ অর্থ, সনদপত্র ও সম্মাননা ক্রেস্ট প্রদান করা হবে।",
      "সাধারণ",
      "",
      "Active"
    ]
  ];

  for (var i = 0; i < defaultNotices.length; i++) {
    sheet.appendRow(defaultNotices[i]);
  }
  return sheet;
}

/**
 * গুণীজন ও প্রতিষ্ঠান প্রধানদের বাণী শিট তৈরি
 */
function setupMessagesSheet(ss) {
  var sheet = ss.getSheetByName("Messages") || ss.insertSheet("Messages");
  sheet.clear();
  var headers = ["SL (ক্রম)", "Name (নাম)", "Role (পদবি ও প্রতিষ্ঠান)", "Message (বাণী ও শুভেচ্ছা বার্তা)", "PhotoUrl (ছবির লিংক বা ড্রাইভ লিংক)", "Status (অবস্থা)"];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#831843").setFontColor("#ffffff");
  sheet.setFrozenRows(1);

  var defaultMessages = [
    [1, "অধ্যক্ষ", "বি.এ.এফ শাহীন কলেজ, কুর্মিটোলা", "দি স্টুডেন্টস ওয়েলফেয়ার ফাউন্ডেশনের এই মেধা অন্বেষণ কার্যক্রম নতুন প্রজন্মের আত্মবিশ্বাস বৃদ্ধি করছে। কোমলমতি শিক্ষার্থীদের প্রতিভা বিকাশে এমন মহতী উদ্যোগ প্রশংসনীয়। আমি এই উদ্যোগের সার্বিক সাফল্য কামনা করি।", "", "Active"],
    [2, "প্রধান শিক্ষক", "বনানী বিদ্যানিকেতন, বনানী, ঢাকা", "বর্তমান প্রতিযোগিতাপূর্ণ বিশ্বে শিক্ষার্থীদের ভিত মজবুত করতে মেধা মূল্যায়ন পরীক্ষার বিকল্প নেই। দীর্ঘ বছর ধরে ফাউন্ডেশন সততা ও নিষ্ঠার সাথে শিক্ষা সহায়তা পরিচালনা করে আসছে।", "", "Active"],
    [3, "প্রধান শিক্ষক", "গভর্নমেন্ট ল্যাবরেটরী হাই স্কুল, ঢাকা", "শিক্ষার্থীদের মেধা শাণিত করার পাশাপাশি নৈতিক শিক্ষা ও আদর্শ নাগরিক হিসেবে গড়ে তোলাই আসল লক্ষ্য। এই ফাউন্ডেশনের আয়োজন শিক্ষার্থীদের মাঝে নতুন উদ্দীপনা সৃষ্টি করে।", "", "Active"],
    [4, "অধ্যক্ষ", "নওয়াব হাবিবুল্লাহ মডেল স্কুল এন্ড কলেজ", "বৃত্তি পরীক্ষা কেবল একটি মূল্যায়ন নয়, এটি শিক্ষার্থীদের ভবিষ্যৎ স্বপ্নকে একধাপ এগিয়ে নিয়ে যাওয়ার সেতুবন্ধন। আমি ফাউন্ডেশনের উত্তরোত্তর সাফল্য কামনা করি।", "", "Active"]
  ];

  for (var i = 0; i < defaultMessages.length; i++) {
    sheet.appendRow(defaultMessages[i]);
  }
  return sheet;
}

/**
 * উপদেষ্টা ও পরিচালনা পরিষদ শিট তৈরি ও ডিফল্ট সদস্য লোড
 */
function setupCommitteeSheet(ss) {
  var commSheet = ss.getSheetByName("Committee") || ss.insertSheet("Committee");
  commSheet.clear();

  var headers = ["Order (ক্রম)", "Name (নাম)", "Role (পদবি)", "Designation (ভূমিকা / পরিচিতি)", "PhotoUrl (ছবির লিংক বা ড্রাইভ লিংক)"];
  commSheet.appendRow(headers);
  commSheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#064e3b").setFontColor("#ffffff");
  commSheet.setFrozenRows(1);

  var defaultMembers = [
    [1, "ড. চৌধুরী মাহমুদ হাসান", "চেয়ারম্যান", "প্রখ্যাত শিক্ষাবিদ ও সমাজসেবক", ""],
    [2, "সাইফুল ইসলাম সাইম", "মহাপরিচালক (পরিচালনায়)", "শিক্ষা সমন্বয়ক ও নির্বাহী প্রধান", ""],
    [3, "আব্দুল্লাহ আল মায়াজ", "ভাইস চেয়ারম্যান", "অর্থ ও গবেষণা বিষয়ক সমন্বয়ক", ""],
    [4, "প্রফেসর ড. মুহাম্মদ আব্দুল করিম", "প্রধান উপদেষ্টা", "সাবেক অধ্যাপক, ঢাকা বিশ্ববিদ্যালয়", ""],
    [5, "ইঞ্জিনিয়ার মো. রফিকুল ইসলাম", "পরীক্ষা নিয়ন্ত্রক", "প্রকৌশলী ও কারিগরি শিক্ষা বিশেষজ্ঞ", ""],
    [6, "মাওলানা এ. এইচ. এম. নোমান", "সদস্য সচিব", "লেখক ও ইসলামিক স্কলার", ""],
    [7, "ড. নাসরিন আক্তার", "মহিলা বিষয়ক সমন্বয়ক", "শিক্ষা ও সমাজকল্যাণ গবেষক", ""]
  ];

  for (var m = 0; m < defaultMembers.length; m++) {
    commSheet.appendRow(defaultMembers[m]);
  }

  return commSheet;
}

/**
 * পরীক্ষার নিয়মাবলী শিট তৈরি
 */
function setupRulesSheet(ss) {
  var sheet = ss.getSheetByName("Rules") || ss.insertSheet("Rules");
  sheet.clear();
  var headers = ["SL (ক্রম)", "Rule (নিয়মাবলী / নির্দেশনা)", "Status (অবস্থা)"];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1e3a8a").setFontColor("#ffffff");
  sheet.setFrozenRows(1);

  var defaultRules = [
    [1, "পরীক্ষায় অংশগ্রহণের জন্য অবশ্যই ওয়েবসাইট থেকে ডাউনলোডকৃত রঙিন বা সাদাকালো প্রবেশপত্র (Admit Card) সাথে নিয়ে আসতে হবে।", "Active"],
    [2, "পরীক্ষা শুরুর ন্যূনতম ৩০ মিনিট পূর্বে পরীক্ষার্থীকে নির্ধারিত পরীক্ষা কেন্দ্রের নির্দিষ্ট আসনে বসতে হবে।", "Active"],
    [3, "বহুনির্বাচনী (MCQ) ও সংক্ষিপ্ত প্রশ্নের উত্তর প্রদানের জন্য শুধুমাত্র কালো কালির বলপেন ব্যবহার করতে হবে।", "Active"],
    [4, "পরীক্ষার হলে কোনো প্রকার মোবাইল ফোন, ডিজিটাল ঘড়ি, ক্যালকুলেটর বা ইলেকট্রনিক ডিভাইস বহন সম্পূর্ণ নিষিদ্ধ।", "Active"],
    [5, "পরীক্ষা শেষে পরিদর্শকের নিকট উত্তরপত্র জমা দিয়ে সুশৃঙ্খলভাবে পরীক্ষার হল ত্যাগ করতে হবে।", "Active"],
    [6, "পরীক্ষার ফলাফল ফাউন্ডেশনের ওয়েবসাইটে প্রকাশিত হবে এবং উত্তীর্ণদের এসএমএসের মাধ্যমে জানানো হবে।", "Active"]
  ];

  for (var i = 0; i < defaultRules.length; i++) {
    sheet.appendRow(defaultRules[i]);
  }
  return sheet;
}

/**
 * শ্রেণীভিত্তিক সিলেবাস ও মানবন্টন শিট তৈরি
 */
function setupSyllabusSheet(ss) {
  var sheet = ss.getSheetByName("Syllabus") || ss.insertSheet("Syllabus");
  sheet.clear();
  var headers = ["Class (শ্রেণী)", "Subject (বিষয়)", "Topics (সিলেবাস ও বিষয়বস্তু)", "Marks (নম্বর)", "ExamDuration (পরীক্ষার সময়)"];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0f766e").setFontColor("#ffffff");
  sheet.setFrozenRows(1);

  var defaultSyllabus = [
    // ৪র্থ শ্রেণী
    ["৪র্থ শ্রেণী", "বাংলা", "গদ্য, পদ্য, ব্যাকরণ ও শব্দার্থ", 25, "২ ঘণ্টা"],
    ["৪র্থ শ্রেণী", "ইংরেজি", "Grammar, Comprehension, Vocabulary", 25, "২ ঘণ্টা"],
    ["৪র্থ শ্রেণী", "গণিত", "পাটিগণিত, ভগ্নাংশ ও জ্যামিতিক ধারণা", 30, "২ ঘণ্টা"],
    ["৪র্থ শ্রেণী", "সাধারণ জ্ঞান ও বিজ্ঞান", "বিজ্ঞান ও বাংলাদেশ পরিচিতি", 20, "২ ঘণ্টা"],

    // ৫ম শ্রেণী
    ["৫ম শ্রেণী", "বাংলা", "পাঠ্যবইয়ের নির্বাচিত অধ্যায়, ব্যাকরণ ও নির্মিতি", 25, "২ ঘণ্টা"],
    ["৫ম শ্রেণী", "ইংরেজি", "Seen/Unseen Passage, Fill in the blanks, Sentence Making", 25, "২ ঘণ্টা"],
    ["৫ম শ্রেণী", "গণিত", "চার প্রক্রিয়া, ল.সা.গু, গ.সা.গু, শতকরা ও জ্যামিতি", 30, "২ ঘণ্টা"],
    ["৫ম শ্রেণী", "প্রাথমিক বিজ্ঞান ও সাধারণ জ্ঞান", "প্রাকৃতিক বিজ্ঞান, পরিবেশ ও সাম্প্রতিক ঘটনাবলী", 20, "২ ঘণ্টা"],

    // ৬ষ্ঠ শ্রেণী
    ["৬ষ্ঠ শ্রেণী", "বাংলা", "সাহিত্য কণিকা, ভাবসম্প্রসারণ ও ব্যাকরণ", 25, "২ ঘণ্টা ৩০ মিনিট"],
    ["৬ষ্ঠ শ্রেণী", "ইংরেজি", "Tense, Preposition, Parts of Speech, Dialogue", 25, "২ ঘণ্টা ৩০ মিনিট"],
    ["৬ষ্ঠ শ্রেণী", "গণিত", "পাটিগণিত, বীজগণিতীয় রাশি ও জ্যামিতিক উপপাদ্য", 30, "২ ঘণ্টা ৩০ মিনিট"],
    ["৬ষ্ঠ শ্রেণী", "সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি", "পদার্থ ও শক্তি, আইসিটি মৌলিক জ্ঞান", 20, "২ ঘণ্টা ৩০ মিনিট"],

    // ৭ম শ্রেণী
    ["৭ম শ্রেণী", "বাংলা", "সপ্তবর্ণা, ব্যাকরণ, সারমর্ম ও প্রবন্ধ", 25, "২ ঘণ্টা ৩০ মিনিট"],
    ["৭ম শ্রেণী", "ইংরেজি", "Transformation, Right form of verbs, Composition", 25, "২ ঘণ্টা ৩০ মিনিট"],
    ["৭ম শ্রেণী", "গণিত", "বীজগণিতীয় সূত্রাবলী, উৎপাদক, সমীকরণ ও ত্রিভুজ", 30, "২ ঘণ্টা ৩০ মিনিট"],
    ["৭ম শ্রেণী", "বিজ্ঞান ও সাধারণ জ্ঞান", "কোষীয় গঠন, সৌরজগৎ ও বাংলাদেশ বিষয়াবলী", 20, "২ ঘণ্টা ৩০ মিনিট"],

    // ৮ম শ্রেণী
    ["৮ম শ্রেণী", "বাংলা", "সাহিত্য কণিকা, ভাষা ও ব্যাকরণ, অনুচ্ছেদ রচনা", 25, "২ ঘণ্টা ৩০ মিনিট"],
    ["৮ম শ্রেণী", "ইংরেজি", "Grammar items, Comprehension & Writing test", 25, "২ ঘণ্টা ৩০ মিনিট"],
    ["৮ম শ্রেণী", "গণিত", "প্যাটার্ন, মুনাফা, বীজগণিতীয় সূত্র ও উপপাদ্য", 30, "২ ঘণ্টা ৩০ মিনিট"],
    ["৮ম শ্রেণী", "সাধারণ বিজ্ঞান ও প্রযুক্তি", "রাসায়নিক বিক্রিয়া, অম্ল-ক্ষার ও আইসিটি", 20, "২ ঘণ্টা ৩০ মিনিট"]
  ];

  for (var j = 0; j < defaultSyllabus.length; j++) {
    sheet.appendRow(defaultSyllabus[j]);
  }
  return sheet;
}

/**
 * পরীক্ষামূলক ডেমো ডাটা ইনপুট
 */
function seedDemoData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupAllSheets();

  var subSheet = ss.getSheetByName("Submissions");
  subSheet.appendRow([
    new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
    "SWF-2026-849201",
    "10524",
    "আব্দুর রহমান",
    "মো: রফিকুল ইসলাম",
    "মোছা: সুফিয়া খাতুন",
    "2014-05-12",
    "ছাত্র",
    "গভর্নメント ল্যাবরেটরী হাই স্কুল",
    "৫ম শ্রেণী",
    "01711223344",
    "01811223344",
    "abdur.rahman@example.com",
    "01721838990",
    "https://drive.google.com",
    "https://drive.google.com",
    "বি.এ.এফ শাহীন কলেজ কেন্দ্র, ঢাকা",
    "২০ নভেম্বর ২০২৬ (সকাল ১০:০০ টা)",
    "অনুমোদিত"
  ]);

  var resSheet = ss.getSheetByName("Results");
  resSheet.appendRow([
    "SWF-2026-849201",
    "10524",
    "আব্দুর রহমান",
    "৫ম শ্রেণী",
    "গভর্নメント ল্যাবরেটরী হাই স্কুল",
    24,
    23,
    29,
    19,
    95,
    "5.00",
    1,
    "ট্যালেন্টপুল বৃত্তি",
    "উত্তীর্ণ"
  ]);

  SpreadsheetApp.getActiveSpreadsheet().toast("ডেমো পরীক্ষার্থী (SWF-2026-849201 / Roll: 10524) যুক্ত হয়েছে!", "সফল", 5);
}
