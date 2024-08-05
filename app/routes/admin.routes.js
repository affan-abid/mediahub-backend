
const { authJwt } = require("../middlewares");
const validationMiddleware = require('../middlewares/validationRequest.js');
const upload = require('../middlewares/uploadMiddleware.js');
const adminController = require("../controllers/admin.controller");

 // Required Objects in Req body
 const updateUserRequiredFields = [
  'full_name',
];

module.exports = function(router) {


  // Get Users Routes
  router.post("/api/get-all-sellers", [authJwt.verifyToken, authJwt.isAdmin], adminController.getAllSellers);
  router.post("/api/get-all-buyers", [authJwt.verifyToken, authJwt.isAdmin], adminController.getAllBuyers);
  router.get("/api/get-user/:id", [authJwt.verifyToken, authJwt.isAdmin], adminController.getUser);
  router.patch("/api/update-user/:id", [validationMiddleware(updateUserRequiredFields), authJwt.verifyToken, authJwt.isAdmin], adminController.updateUser);
  router.patch("/api/toggle-user-status/:id", [authJwt.verifyToken, authJwt.isAdmin], adminController.updateUserStatus);

  // Assets Api
  router.post('/api/create-asset', [authJwt.verifyToken, authJwt.isAdmin, upload.array('media')], adminController.createAsset);
  router.post('/api/get-all-assets', [authJwt.verifyToken, authJwt.isAdmin], adminController.getAllAssets);
  router.get('/api/get-asset/:id', [authJwt.verifyToken, authJwt.isAdmin], adminController.getAsset);
  router.post('/api/get-assets-by-creator/:creator_id', [authJwt.verifyToken, authJwt.isAdmin], adminController.getAssetsByCreator);
  router.delete('/api/delete-asset-media/:asset_id/:media_id', [authJwt.verifyToken, authJwt.isAdmin], adminController.deleteMediaAssets);
  router.patch('/api/update-asset/:id', [authJwt.verifyToken, authJwt.isAdmin, upload.array('media')], adminController.updateAsset);
  router.patch("/api/toggle-asset-status/:id", [authJwt.verifyToken, authJwt.isAdmin], adminController.updateAssetStatus);
  router.post('/api/sellers-with-asset-count', [authJwt.verifyToken, authJwt.isAdmin], adminController.getSellersWithAssetCount);
  router.get('/api/get-all-keywords', [authJwt.verifyToken, authJwt.isAdmin], adminController.getAllKeywords);

};
