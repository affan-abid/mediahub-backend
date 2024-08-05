// validationMiddleware.js

module.exports = function(requiredFields) {
    return async function(req, res, next) {
        let missingFields = [];
        
        requiredFields.forEach(field => {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                errorCode: 400,
                errorMessage: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        next();
    };
};
