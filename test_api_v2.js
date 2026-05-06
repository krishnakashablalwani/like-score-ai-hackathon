const API_URL = 'https://script.google.com/macros/s/AKfycbyxLxK9AMeGiMEQj5eSulV3aLkpapC9EsMvdGy8MLFLyf2xJclvGTurCZ9UpbqjnrEYbg/exec';

async function test() {
  try {
    console.log('Testing Teams Action...');
    const teamsRes = await fetch(API_URL + '?action=teams');
    const teamsText = await teamsRes.text();
    console.log('Teams Status:', teamsRes.status);
    console.log('Teams Preview:', teamsText.substring(0, 100));

    console.log('\nTesting Responses Action...');
    const respRes = await fetch(API_URL);
    const respText = await respRes.text();
    console.log('Responses Status:', respRes.status);
    console.log('Responses Preview:', respText.substring(0, 100));

  } catch (e) {
    console.error('Test Failed:', e);
  }
}

test();
