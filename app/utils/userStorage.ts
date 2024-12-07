interface User {
  username: string;
  password: string;
  name: string;
  email: string;
}

export const saveUser = (user: User) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
};

export const getUser = (username: string): User | undefined => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  return users.find((user: User) => user.username === username);
};

export const updateUserPassword = (username: string, newPassword: string) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex((user: User) => user.username === username);
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }
  return false;
};

// Función para agregar un usuario de ejemplo
export const addExampleUser = () => {
  const exampleUser: User = {
    username: 'moshe',
    password: 'moses666',
    name: 'Example User',
    email: 'moshe@xolorealm.com'
  };
  saveUser(exampleUser);
};

