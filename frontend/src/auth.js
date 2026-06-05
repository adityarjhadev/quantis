const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

function normalize(email) {
  return email.toLowerCase().trim();
}

export function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function signup(email, password) {
  email = normalize(email);
  password = password.trim();

  const users = getUsers();

  const exists = users.find((u) => u.email === email);
  if (exists) return { ok: false, error: "User already exists" };

  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }

  const newUser = {
    email,
    password,
    createdAt: Date.now(),
  };

  users.push(newUser);
  saveUsers(users);

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ email }));
  return { ok: true };
}

export function login(email, password) {
  email = normalize(email);
  password = password.trim();

  const users = getUsers();

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) return { ok: false, error: "Invalid credentials" };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ email }));
  return { ok: true };
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}