import { Auth, getUser } from './auth';
import { createFragment, getUserFragments, getUserFragmentsExpanded, getUserFragmentByID, deleteUserFragment, updateUserFragment } from './api';
//import sharp from 'Sharp'

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const createFragBtn = document.querySelector('#createFrag');
  const fragText = document.querySelector('#fragText');
  const fragFile = document.querySelector('#fragFile');
  const contentType = document.querySelector('#contentType');

  const userFrags = document.querySelector('#userFragments');

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
  await getFragmentsExpanded();

  //Setting up file input
  fragFile.addEventListener('change', (event) => {
    const fileType = event.target.files[0].type;
    readFileData(event.target.files[0], function(e) {
      //console.log(e.target.result)
      fileData = e.target.result;

      /*var tempbuffer = Buffer.from(fileData);
      console.log(tempbuffer)
      testImg.src = URL.createObjectURL(new Blob([tempbuffer.buffer], {type: fileType}));*/

      /*var tempbuffer = new Uint8Array(Buffer.from(fileData));
      console.log(Buffer.from(tempbuffer).toString('base64'));
      testImg.src = `${`data:${fileType};base64,${tempbuffer}`}`*/
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
      await getFragmentsExpanded();
    }
    else if (fragText.value != '') {
      fragmentData = fragText.value;
      await createFragment(user, fragmentData, type);
      await getFragmentsExpanded();
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

    var html = '<table>';
    for (var i = 0; i < data.fragments.length; i++) {
      html += `<tr>${await getFragmentByID(data.fragments[i].id)}</tr>`
    }
    html += '</table>'
    userFrags.innerHTML = html;

    //Appending buttons to table
    for (var i = 0; i < data.fragments.length; i++) {
      //Delete Button
      var deleteBtn = document.createElement('button');
      var id = data.fragments[i].id
      deleteBtn.innerHTML = 'Delete';
      deleteBtn.onclick = function() {
        console.log(`Deleting ${id}`)
        deleteFragment(id);
        getFragmentsExpanded();
      }
      var deleteButton = document.querySelector(`#delete-${data.fragments[i].id}`);
      deleteButton.appendChild(deleteBtn);

      //Update Button
      var updateBtn = document.createElement('button');
      var id = data.fragments[i].id
      updateBtn.innerHTML = 'Update';
      updateBtn.onclick = function() {
        console.log(`Updating ${id}`)
        updateFragment(id);
        getFragmentsExpanded();
      }
      var updateButton = document.querySelector(`#update-${data.fragments[i].id}`);
      updateButton.appendChild(updateBtn);
    }
  }

  async function getFragmentByID(id) {
    const data = await getUserFragmentByID(user, id);
    console.log('Got data ', { data });

    return `<td>${id}</td><td>${data}</td><td id='delete-${id}'></td><td id='update-${id}'></td>`
  }

  async function deleteFragment(id) {
    await deleteUserFragment(user, id);
    console.log('Deleted fragment ' + id)
  }

  async function updateFragment(id) {
    const type = contentType.value;
    var fragmentData;
    if (fragFile && fragFile.value) {
      fragmentData = fileData;
      await updateUserFragment(user, id, fragmentData, type);
      console.log(`Updated fragment ${id}`)
    }
    else if (fragText.value != '') {
      fragmentData = fragText.value;
      await updateUserFragment(user, id, fragmentData, type);
      console.log(`Updated fragment ${id}`)
    }
    else {
      alert('Enter text or a file for a fragment')
    }
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