export function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

export function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

export function signup(email, password) {
  const users = getUsers();

  const exists = users.find((u) => u.email === email);
  if (exists) return { ok: false, error: "User already exists" };

  users.push({ email, password });
  saveUsers(users);

  localStorage.setItem("currentUser", JSON.stringify({ email }));
  return { ok: true };
}

export function login(email, password) {
  const users = getUsers();

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) return { ok: false, error: "Invalid credentials" };

  localStorage.setItem("currentUser", JSON.stringify({ email }));
  return { ok: true };
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

export function logout() {
  localStorage.removeItem("currentUser");
}