const { authJwt } = require("../middlewares");
const validationMiddleware = require('../middlewares/validationRequest.js');
const upload = require('../middlewares/uploadMiddleware.js');
const adminController = require("../controllers/admin.controller");

 // Required Objects in Req body
 const updateUserRequiredFields = [
  'full_name',
];

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Get Users Routes
  app.post("/api/get-all-sellers", [authJwt.verifyToken, authJwt.isAdmin], adminController.getAllSellers);
  app.post("/api/get-all-buyers", [authJwt.verifyToken, authJwt.isAdmin], adminController.getAllBuyers);
  app.get("/api/get-user/:id", [authJwt.verifyToken, authJwt.isAdmin], adminController.getUser);
  app.patch("/api/update-user/:id", [validationMiddleware(updateUserRequiredFields), authJwt.verifyToken, authJwt.isAdmin], adminController.updateUser);
  app.patch("/api/toggle-user-status/:id", [authJwt.verifyToken, authJwt.isAdmin], adminController.updateUserStatus);

  // Assets Api
  app.post('/api/create-asset', [authJwt.verifyToken, authJwt.isAdmin, upload.array('media')], adminController.createAsset);
  app.post('/api/get-all-assets', [authJwt.verifyToken, authJwt.isAdmin], adminController.getAllAssets);
  app.get('/api/get-asset/:id', [authJwt.verifyToken, authJwt.isAdmin], adminController.getAsset);
  app.post('/api/get-assets-by-creator/:creator_id', [authJwt.verifyToken, authJwt.isAdmin], adminController.getAssetsByCreator);
  app.delete('/api/delete-asset-media/:asset_id/:media_id', [authJwt.verifyToken, authJwt.isAdmin], adminController.deleteMediaAssets);
  app.patch('/api/update-asset/:id', [authJwt.verifyToken, authJwt.isAdmin, upload.array('media')], adminController.updateAsset);
  app.patch("/api/toggle-asset-status/:id", [authJwt.verifyToken, authJwt.isAdmin], adminController.updateAssetStatus);
  app.post('/api/sellers-with-asset-count', [authJwt.verifyToken, authJwt.isAdmin], adminController.getSellersWithAssetCount);
  app.get('/api/get-all-keywords', [authJwt.verifyToken, authJwt.isAdmin], adminController.getAllKeywords);

};
