const express = require("express");
const router = express.Router();
const { getAllUsers, getUserByUid, createUser, login, addFriendByUid, getLoggedUserFriends, getAllLoggedUserNoFriends, getLoggedUserAndSelectedUserMessages, setLoggedUserAndSelectedUserMessages, changeOnlineStatusToOffline } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @route GET api/users
 * @description Get all the users from the database.
 * @param {null} - No parameters is required.
 * @returns {object} - [{ uid, username,created_at }] list of all users
 */
router.get("/", getAllUsers);


/**
 * @route GET api/users/getUsersExpect
 * @description Get all other users from the database expect itself 
 * @todo This endpoint is under testing and not fully implemented
 * 
 * router.get("/getUsersExpect/:uid", getUsersExpect);
 */


/**
 * @route api/users/:username
 * @description Get the user through uid of user.
 * @param {string} uid - unique user id of user.
 * @returns {object} - { uid, username, status, profile_pic, created_at }
 */
router.get("/:uid", getUserByUid);


/**
 * @route POST api/users/login
 * @description Login a user using username and password and sets a jwt token in an HttpOnly cookie.
 * @param username - username of logging user
 * @param password - password of logging user
 * @return {object} 200 - success: uid, username, token
 * @returns {object} 400 - error: message
 */
router.post("/login", login);


/**
 * @route POST api/users
 * @description Creates a new user and sets a jwt token in an HttpOnly cookie.
 * @header {Set-Cookie} token - Jwt token in HttpOnly cookie.
 * @param {string} username - The username for the new user.
 * @param {string} password - The password for the new user(will be hashed using bcrypt).
 * @returns {object} 200 - { uid, username } and sets an HttpOnly cookie with a jwt token.
 * @returns {object} 400 - Error message if failed.
 */
router.post("/", createUser);


/**
 * @route api/users/friends/:frnduid 
 * @method post 
 * @description Add a friend for logged user
 * @param {string} frnduid - UID of the friend to be added
 * @header {string} Authorization - jwt token for user auth
 * @return {object} 200
 * @return {object} 400 - error message 
 */
// router.post("/friends/:frnduid", authMiddleware, addFriendByUid);
router.post("/friends", addFriendByUid);


router.get("/friends/:uid", getLoggedUserFriends);


router.get("/no_friends/:uid", getAllLoggedUserNoFriends);


router.get("/:loggedUid/messages/:selectedUid", getLoggedUserAndSelectedUserMessages);


router.post("/:loggedUid/messages/:selectedUid", setLoggedUserAndSelectedUserMessages);


router.put("/to_offline/:uid", changeOnlineStatusToOffline);
module.exports = router;