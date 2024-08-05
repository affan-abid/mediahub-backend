
const SetupRoutes = (app) => {
  const admin = require("./admin.routes");
  const auth = require("./auth.routes");
 
  admin(app);
  auth(app);

};

module.exports = { SetupRoutes };
