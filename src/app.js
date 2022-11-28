import { Auth, getUser } from './auth';
import { createFragment, getUserFragments, getUserFragmentsExpanded, getUserFragmentByID } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const createFragBtn = document.querySelector('#createFrag');
  const fragText = document.querySelector('#fragText');
  const fragFile = document.querySelector('#fragFile');
  const contentType = document.querySelector('#contentType');

  var fileData;

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }
  getFragmentsExpanded();

  //Setting up file input
  fragFile.addEventListener('change', (event) => {
    readFileData(event.target.files[0], function(e) {
      console.log(e.target.result)
      fileData = e.target.result;
    })
  })

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  createFragBtn.onclick = async () => {
    const type = contentType.value;
    var fragmentData;
    if (fragFile && fragFile.value) {
      fragmentData = fileData;
      await createFragment(user, fragmentData, type);
      getFragmentsExpanded();
    }
    else if (fragText.value != '') {
      fragmentData = fragText.value;
      await createFragment(user, fragmentData, type);
      getFragmentsExpanded();
    }
    else {
      alert('Enter text or a file for a fragment')
    }
  }

  async function getFragments() {
    const data = await getUserFragments(user)
    console.log('Got fragments ', { data });
    console.log(data['fragments'])
  }

  async function getFragmentsExpanded() {
    const data = await getUserFragmentsExpanded(user);
    console.log('Got expanded fragments ', { data });
  }

  async function getUserFragmentByID(id) {
    const data = await getUserFragmentByID(user, id);
    console.log('Got data ', { data });
  }

  /*async function createFragment(fragmentData, type) {
    const data = await postFragment(user, fragmentData, type);
    console.log('POST response: ', { data });
  }*/

  function readFileData(file, onLoadCallback) {
    var reader = new FileReader();
    reader.onload = onLoadCallback;
    reader.readAsText(file)
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);