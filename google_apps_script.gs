const TEAMS_SHEET = 'Teams';
const QUESTIONS_SHEET = 'Questions';
const RESPONSES_SHEET = 'Responses';
const SCORES_SHEET = 'Scores';

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var teamsSheet = ss.getSheetByName(TEAMS_SHEET);
  if (!teamsSheet) {
    teamsSheet = ss.insertSheet(TEAMS_SHEET);
  }
  var teamsRange = teamsSheet.getRange(1, 1, 1, 4);
  teamsRange.setValues([['Team Name', 'Member 1', 'Member 2', 'Member 3']]);
  teamsRange.setFontWeight('bold');

  var questionsSheet = ss.getSheetByName(QUESTIONS_SHEET);
  if (!questionsSheet) {
    questionsSheet = ss.insertSheet(QUESTIONS_SHEET);
  }
  var questionsRange = questionsSheet.getRange(1, 1, 1, 5);
  questionsRange.setValues([['Question', 'Option 1', 'Option 2', 'Option 3', 'Option 4']]);
  questionsRange.setFontWeight('bold');

  var responsesSheet = ss.getSheetByName(RESPONSES_SHEET);
  if (!responsesSheet) {
    responsesSheet = ss.insertSheet(RESPONSES_SHEET);
  }
  var numQuestions = 0;
  var qData = questionsSheet.getDataRange().getValues();
  for (var i = 1; i < qData.length; i++) {
    if (String(qData[i][0]).trim()) numQuestions++;
  }
  if (numQuestions === 0) numQuestions = 10;

  var headers = ['Team ID', 'Team Name', 'Member Name'];
  for (var q = 1; q <= numQuestions; q++) {
    headers.push('Q' + q);
  }
  headers.push('Timestamp');
  var responsesRange = responsesSheet.getRange(1, 1, 1, headers.length);
  responsesRange.setValues([headers]);
  responsesRange.setFontWeight('bold');

  // Setup the Scores sheet
  var scoresSheet = ss.getSheetByName(SCORES_SHEET);
  if (!scoresSheet) {
    scoresSheet = ss.insertSheet(SCORES_SHEET);
  }
  var scoresHeaders = ['Team ID', 'Team Name', 'Team Score', 'Eligibility', 'Completion'];
  var scoresRange = scoresSheet.getRange(1, 1, 1, scoresHeaders.length);
  scoresRange.setValues([scoresHeaders]);
  scoresRange.setFontWeight('bold');
  
  // Retroactively calculate scores for any responses already submitted during beta testing
  recalculateAllScores(ss);
}

function recalculateAllScores(ss) {
  const responsesSheet = ss.getSheetByName(RESPONSES_SHEET);
  if (!responsesSheet) return;
  
  const respData = responsesSheet.getDataRange().getValues();
  const uniqueTeams = {};
  
  // Find all teams that have responses (skip header)
  for (let i = 1; i < respData.length; i++) {
    const tId = String(respData[i][0]);
    const tName = String(respData[i][1]);
    if (tId) {
      uniqueTeams[tId] = tName;
    }
  }

  for (let tId in uniqueTeams) {
    updateTeamScore(ss, tId, uniqueTeams[tId]);
  }
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'answers';
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'teams') {
    return getTeams(ss);
  } else if (action === 'questions') {
    return getQuestions(ss);
  } else if (action === 'clear') {
    return clearResponses(ss);
  } else {
    return getAnswers(ss);
  }
}

function getTeams(ss) {
  const sheet = ss.getSheetByName(TEAMS_SHEET);
  const data = sheet.getDataRange().getValues();
  const teams = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const name = String(row[0]).trim();
    if (!name) continue;

    const members = [];
    for (let j = 1; j < row.length; j++) {
      const member = String(row[j]).trim();
      if (member) members.push(member);
    }

    if (members.length > 0) {
      teams.push({
        id: String(i),
        name: name,
        members: members
      });
    }
  }

  return ContentService.createTextOutput(JSON.stringify(teams))
    .setMimeType(ContentService.MimeType.JSON);
}

function getQuestions(ss) {
  const sheet = ss.getSheetByName(QUESTIONS_SHEET);
  const data = sheet.getDataRange().getValues();
  const questions = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const text = String(row[0]).trim();
    if (!text) continue;

    const options = [];
    for (let j = 1; j < row.length; j++) {
      const opt = String(row[j]).trim();
      if (opt) options.push(opt);
    }

    questions.push({
      id: i,
      text: text,
      options: options
    });
  }

  return ContentService.createTextOutput(JSON.stringify(questions))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAnswers(ss) {
  const sheet = ss.getSheetByName(RESPONSES_SHEET);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const result = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const teamId = String(row[0]);
    const memberName = String(row[2]);

    if (!teamId || !memberName) continue;

    const answers = [];
    // Columns from index 3 onward (up to the second-to-last column) are answers
    // Last column is timestamp
    for (let q = 3; q < row.length - 1; q++) {
      const val = row[q];
      answers.push(val !== '' && val !== undefined && val !== null ? String(val) : '');
    }

    if (!result[teamId]) {
      result[teamId] = {};
    }
    result[teamId][memberName] = answers;
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function clearResponses(ss) {
  const sheet = ss.getSheetByName(RESPONSES_SHEET);
  if (sheet) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(RESPONSES_SHEET);
    if (!sheet) {
      sheet = ss.insertSheet(RESPONSES_SHEET);
    }

    const body = JSON.parse(e.postData.contents);
    const { teamId, teamName, memberName, answers } = body;

    // Ensure headers exist
    if (sheet.getLastRow() === 0) {
      const numQ = answers.length;
      const headers = ['Team ID', 'Team Name', 'Member Name'];
      for (let i = 1; i <= numQ; i++) {
        headers.push('Q' + i);
      }
      headers.push('Timestamp');
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    // Check if row already exists for this teamId + memberName
    const data = sheet.getDataRange().getValues();
    let existingRow = -1;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(teamId) && String(data[i][2]) === String(memberName)) {
        existingRow = i + 1;
        break;
      }
    }

    const rowData = [teamId, teamName, memberName, ...answers, new Date().toISOString()];

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    // Calculate and update the team's score in the Scores sheet
    updateTeamScore(ss, teamId, teamName);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function updateTeamScore(ss, teamId, teamName) {
  let scoresSheet = ss.getSheetByName(SCORES_SHEET);
  if (!scoresSheet) {
    scoresSheet = ss.insertSheet(SCORES_SHEET);
    var scoresHeaders = ['Team ID', 'Team Name', 'Team Score', 'Eligibility', 'Completion'];
    var scoresRange = scoresSheet.getRange(1, 1, 1, scoresHeaders.length);
    scoresRange.setValues([scoresHeaders]);
    scoresRange.setFontWeight('bold');
  }

  // Get total members for this team from TEAMS_SHEET
  const teamsSheet = ss.getSheetByName(TEAMS_SHEET);
  const teamsData = teamsSheet ? teamsSheet.getDataRange().getValues() : [];
  let totalMembers = 0;
  for (let i = 1; i < teamsData.length; i++) {
    if (String(i) === String(teamId)) {
      const row = teamsData[i];
      for (let j = 1; j < row.length; j++) {
        if (String(row[j]).trim()) totalMembers++;
      }
      break;
    }
  }

  const responsesSheet = ss.getSheetByName(RESPONSES_SHEET);
  const respData = responsesSheet.getDataRange().getValues();
  let teamResponses = [];
  
  for (let i = 1; i < respData.length; i++) {
    if (String(respData[i][0]) === String(teamId)) {
      const answers = [];
      for (let q = 3; q < respData[i].length - 1; q++) { // exclude timestamp
        answers.push(respData[i][q]);
      }
      teamResponses.push(answers);
    }
  }

  let score = 'Pending';
  let eligibility = 'Pending';

  // Calculate score ONLY if ALL members have submitted
  if (teamResponses.length > 0 && teamResponses.length === totalMembers) { 
    let matchingAnswers = 0;
    let numQuestions = teamResponses[0].length;
    for (let q = 0; q < numQuestions; q++) {
       let allMatch = true;
       let firstAns = teamResponses[0][q];
       for (let r = 0; r < teamResponses.length; r++) {
         if (teamResponses[r][q] === undefined || teamResponses[r][q] === '' || String(teamResponses[r][q]) !== String(firstAns)) {
            allMatch = false;
            break;
         }
       }
       if (allMatch && firstAns !== '') {
         matchingAnswers++;
       }
    }
    score = numQuestions > 0 ? Math.round((matchingAnswers / numQuestions) * 100) : 0;
    eligibility = score >= 90 ? 'Yes' : 'No';
  }

  // Format Completion
  let completion = `${teamResponses.length}/${totalMembers || '?'}`;

  const scoreData = scoresSheet.getDataRange().getValues();
  let existingRow = -1;
  for (let i = 1; i < scoreData.length; i++) {
    if (String(scoreData[i][0]) === String(teamId)) {
      existingRow = i + 1;
      break;
    }
  }

  const rowData = [teamId, teamName, score, eligibility, completion];
  if (existingRow > 0) {
    scoresSheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    scoresSheet.appendRow(rowData);
  }
}
