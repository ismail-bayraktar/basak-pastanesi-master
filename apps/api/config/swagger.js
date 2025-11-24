import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Swagger Configuration
 * API Documentation with OpenAPI 3.0
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tulumbak Baklava API',
      version: '2.0.0',
      description: 'E-ticaret RESTful API Documentation',
      contact: {
        name: 'Tulumbak Backend Team',
        email: 'backend@tulumbak.dev'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.SWAGGER_DEV_URL || `http://localhost:${process.env.PORT || 4001}`,
        description: 'Development server'
      },
      {
        url: process.env.SWAGGER_PROD_URL || process.env.BACKEND_URL || 'https://api.tulumbak.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Products',
        description: 'Product management endpoints'
      },
      {
        name: 'Orders',
        description: 'Order management endpoints'
      },
      {
        name: 'Users',
        description: 'User authentication and management'
      },
      {
        name: 'Coupons',
        description: 'Coupon management endpoints'
      },
      {
        name: 'Delivery',
        description: 'Delivery zones and time slots'
      },
      {
        name: 'Reports',
        description: 'Sales and analytics reports'
      },
      {
        name: 'Settings',
        description: 'System settings management'
      },
      {
        name: 'Admin',
        description: 'Admin management'
      },
      {
        name: 'Courier',
        description: 'Courier tracking and management'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'description', 'basePrice', 'category'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            basePrice: { type: 'number' },
            category: { type: 'string' },
            stock: { type: 'number' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            items: { type: 'array' },
            amount: { type: 'number' },
            status: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app) => {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Tulumbak API Documentation'
  }));

  // JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default swaggerDocs;

