const { verifySignUp } = require("../middlewares");
const validationMiddleware = require('../middlewares/validationRequest.js');
const authController = require("../controllers/auth.controller");

 // Required Objects in Req body
 const addUserRequiredFields = [
  'full_name',
  'username',
  'email', 
  'password',
  'role'
];

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/signup",
    [
      validationMiddleware(addUserRequiredFields),
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted,
    ],
    authController.signup
  );

  app.post("/api/login", authController.login);
};
