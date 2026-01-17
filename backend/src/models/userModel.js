// models/userModel.js
// This defines the data structure. using a simple array for demo purposes 
// or a mock class if no DB is connected yet.

class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

// Mock database
export const users = [
  new User(1, "Alice", "alice@example.com"),
  new User(2, "Bob", "bob@example.com"),
];

export default User;
