module.exports = {
    BASE_URL: 'http://localhost:4000',
    NODE_PORT: 4000,
    TOKEN_EXPIRY: 300000,
    APP_REQUEST_DATE_FORMAT: "YYYY-MM-DD",
    
    STATUS: {
        Active: 'Active',
        Pending: 'Pending',
        Inactive: 'Inactive',
    },

    ROLES: {
      BUYER: 'buyer',
      ADMIN: 'admin',
      SELLER: 'seller',
    },

    MAX_BANNER_IMAGE_LIMIT_FOR_CUSTOMER: 10,
    MAX_BANNER_IMAGE_LIMIT_FOR_BUSINESS: 10,
}