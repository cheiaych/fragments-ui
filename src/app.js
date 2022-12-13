import { Auth, getUser } from './auth';
import { createFragment, getUserFragments, getUserFragmentsExpanded, getUserFragmentByID, deleteUserFragment, updateUserFragment, getUserFragmentByIDConvert } from './api';
import { isEmpty } from '@aws-amplify/core';
//import sharp from 'Sharp'

async function init() {
  const textTypes = [
    `txt`,
    `json`,
    `md`,
    `html`,
  ];
  const imageTypes = [
    `png`,
    `jpg`,
    `webp`,
    `gif`,
  ];
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const createFragBtn = document.querySelector('#createFrag');
  const fragText = document.querySelector('#fragText');
  const fragFile = document.querySelector('#fragFile');
  const contentType = document.querySelector('#contentType');
  const removeUpload = document.querySelector('#removeUpload')

  const userFrags = document.querySelector('#userFragments');

  const testImg = document.querySelector('#testImg')

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
    //console.log(event.target.files[0])
    const fileType = event.target.files[0].type;
    readFileData(event.target.files[0], function(e) {
      fileData = e.target.result;
      console.log(fileData)
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
    fragText.value = '';
    fragFile.value = null;
    fragmentData = null;
  }

  removeUpload.onclick = async () => {
    fragFile.value = null;
    fragmentData = null;
  }

  async function getFragments() {
    const data = await getUserFragments(user)
    console.log('Got fragments ', { data });
    console.log(data['fragments'])
  }

  async function getFragmentsExpanded() {
    const data = await getUserFragmentsExpanded(user);
    console.log('Got expanded fragments ', { data });

    var html = '<table><tr><th>ID</th><th>Content-Type</th><th>Content</th><th>Delete</th><th>Update</th><th>Convert</th></tr>';
    for (var i = 0; i < data.fragments.length; i++) {
      html += `<tr>${await getFragmentByID(data.fragments[i].id, data.fragments[i].type)}</tr>`
    }
    html += '</table>'
    userFrags.innerHTML = html;

    //Appending buttons to table
    for (var i = 0; i < data.fragments.length; i++) {
      generateButtons(data.fragments[i].id, data.fragments[i].type);
    }
  }

  //Generates delete, update, and convert buttons
  function generateButtons (id, type) {
    //Delete Button
    var deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = 'Delete';
    deleteBtn.onclick = async function() {
      console.log(`Deleting ${id}`)
      await deleteFragment(id);
      getFragmentsExpanded();
    }
    var deleteButton = document.querySelector(`#delete-${id}`);
    deleteButton.appendChild(deleteBtn);

    //Update Button
    var updateBtn = document.createElement('button');
    updateBtn.innerHTML = 'Update';
    updateBtn.onclick = async function() {
      console.log(`Updating ${id}`)
      await updateFragment(id);
      getFragmentsExpanded();
    }
    var updateButton = document.querySelector(`#update-${id}`);
    updateButton.appendChild(updateBtn);

    //Convert Dropdown and button
    var convertSelect = document.createElement('select');
    convertSelect.id = `convertSelect-${id}`
    if (type.includes('text') || type == 'application/json') {
      for (var j = 0; j < textTypes.length; j++) {
        var option = document.createElement('option');
        option.value = textTypes[j];
        option.text = textTypes[j];
        convertSelect.appendChild(option)
      }
    }
    else if (type.includes('image')) {
      for (var j = 0; j < imageTypes.length; j++) {
        var option = document.createElement('option');
        option.value = imageTypes[j];
        option.text = imageTypes[j];
        convertSelect.appendChild(option)
      }
    }

    var convertBtn = document.createElement('button');
    convertBtn.innerHTML = 'Convert';
    convertBtn.onclick = async function() {
      var ext = document.querySelector(`#convertSelect-${id}`).value;
      console.log(`Converting fragment ${id} to type ${ext}`);
      await convertFragment(id, type, ext);
    }

    var convert = document.querySelector(`#convert-${id}`);
    convert.appendChild(convertSelect);
    convert.appendChild(convertBtn)
  }

  async function getFragmentByID(id, type) {
    const data = await getUserFragmentByID(user, id);
    console.log('Got data ', { data });

    var processedData;
    if (type.includes('text') || type == 'application/json') {
      processedData = `<xmp>${Buffer.from(data).toString('utf8')}</xmp>`
      console.log(processedData);
    }
    else if (type.includes('image')) {
      console.log(data)
      var imgString = Buffer.from(data).toString('base64');
      console.log(imgString);
      processedData = `<img src='${`data:${type};base64,${imgString}`}'>`
    }

    return `<td>${id}</td><td>${type}</td><td>${processedData}</td><td id='delete-${id}'></td><td id='update-${id}'></td><td id='convert-${id}'></td>`
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
    fragText.value = '';
    fragFile.value = null;
    fragmentData = null;
  }

  async function convertFragment(id, type, ext) {
    const res = await getUserFragmentByIDConvert(user, id, ext)
    const data = await res.arrayBuffer();
    const newType = res.headers.get('Content-Type')
    console.log(`Got converted data `, { data });
    var processedData;
    if (newType.includes('text') || newType == 'application/json') {
      processedData = `<xmp>${Buffer.from(data).toString('utf8')}</xmp>`
      //console.log(processedData);
      var w = window.open("");
      w.document.write(processedData);
    }

    else if (newType.includes('image')) {
      var imgString = Buffer.from(data).toString('base64');
      //console.log(imgString);
      var image = new Image()
      image.src = `${`data:${newType};base64,${imgString}`}`
      var w = window.open("");
      w.document.write(image.outerHTML);
    }
  }

  /*async function createFragment(fragmentData, type) {
    const data = await postFragment(user, fragmentData, type);
    console.log('POST response: ', { data });
  }*/

  function readFileData(file, onLoadCallback) {
    var reader = new FileReader();
    reader.onload = onLoadCallback;
    reader.readAsArrayBuffer(file)
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);