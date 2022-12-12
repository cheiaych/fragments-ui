// src/api.js

// fragments microservice API, defaults to localhost:8080
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user) {
  console.log('Requesting user fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data
    //console.log("id is " + typeof(data.fragments[1]))
  } catch (err) {
    console.error('Unable to call GET /v1/fragment', { err });
    return err;
  }
}

export async function getUserFragmentsExpanded(user) {
  console.log('Requesting expanded user fragments data...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/?expand=1`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data
    //console.log("id is " + typeof(data.fragments[1]))
  } catch (err) {
    console.error('Unable to call GET /v1/fragment/?expand=1', { err });
    return err;
  }
}

export async function createFragment(user, data, type) {
  console.log(user.authorizationHeaders());
  console.log('Creating a fragment with data ' + data);
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: 'POST',
      mode: 'cors',
      headers: user.authorizationHeaders(type),
      body: Buffer.from(data)
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
  }
  catch (err) {
    console.error('Unable to call POST /v1/fragments', { err });
  }
}

export async function getUserFragmentByID(user, id) {
  console.log('Requesting user fragment data from ' + `${apiUrl}/v1/fragments/${id}` + '...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = res.arrayBuffer();
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragments/' + id, { err });
    return err;
  }
}

export async function getUserFragmentByIDConvert(user, id, ext) {
  console.log('Requesting user fragment data from ' + `${apiUrl}/v1/fragments/${id}.${ext}` + '...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}.${ext}`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    console.log(`Converted to type ${res.headers.get('Content-Type')}`);
    const data = res.arrayBuffer();
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragments/' + id + '.' + ext, { err });
    return err;
  }
}

export async function deleteUserFragment(user, id) {
  console.log('Deleting fragment from ' + `${apiUrl}/v1/fragments/${id}` + '...');
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      // Generate headers with the proper Authorization bearer token to pass
      method: 'DELETE',
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.error('Unable to call DELETE /v1/fragments/' + id, { err });
    return err;
  }
}

export async function updateUserFragment(user, id, data, type) {
  console.log(user.authorizationHeaders());
  console.log('Updating fragment ' + id + ' with data ' + data);
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: 'PUT',
      mode: 'cors',
      headers: user.authorizationHeaders(type),
      body: Buffer.from(data)
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
  }
  catch (err) {
    console.error('Unable to call PUT /v1/fragments/' + id, { err });
  }
}