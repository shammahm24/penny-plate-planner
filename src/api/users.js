import users from '../data/users.json';

let usersData = [...users];

export function getUsers() {
  return usersData;
}

export function getUserByEmail(email) {
  return usersData.find(u => u.email === email);
}

export function getUserById(id) {
  return usersData.find(u => u.id === id);
}

export function addUser(userData) {
  const newUser = {
    id: `u${Date.now()}`,
    ...userData,
    isFirstTime: true
  };
  usersData.push(newUser);
  return newUser;
}

export function updateUser(id, updates) {
  const userIndex = usersData.findIndex(u => u.id === id);
  if (userIndex !== -1) {
    usersData[userIndex] = { ...usersData[userIndex], ...updates };
    return usersData[userIndex];
  }
  return null;
}