const client = require("./client");
const bcrypt = require("bcrypt");
const SALT_COUNT = 10;

// database functions

// user functions
async function createUser({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
//   let userToAdd = { username, hashedPassword };
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    INSERT INTO users(username, password ) 
    VALUES($1, $2)
    ON CONFLICT (username) DO NOTHING
    RETURNING *
    `,
      [username, hashedPassword]
    );
    delete user.password;
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getUser({ username, password }) {
  const user = await getUserByUsername(username);
  const hashedPassword = user.password;

  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT * FROM users
      WHERE username=$1
          `,
      [username]
    );

    let passwordsMatch = await bcrypt.compare(password, hashedPassword);
    if (passwordsMatch) {
      // return the user object (without the password)
      delete user.password;
      return user;
    }
  } catch (error) {
    console.log(error);
  }
}

async function getUserById(userId) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT * FROM users
      WHERE id=$1
    `,
      [userId]
    );
    delete user.password;
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getUserByUsername(userName) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    SELECT * from users
    WHERE username=$1;   
    `,
      [userName]
    );

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
