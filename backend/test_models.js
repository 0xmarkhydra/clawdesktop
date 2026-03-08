const key = 'AIzaSyD6Bp8t1rz9Xzooykn2kN_Cd1nW2gni5ls';

async function list() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    console.log("SUPPORTED MODELS:", data.models?.map(m => m.name));
  } catch (e) {
    console.error("Error:", e);
  }
}

list();
