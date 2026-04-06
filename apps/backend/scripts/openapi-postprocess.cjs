const fs = require('fs');
const path = require('path');

const OPENAPI_PATH = path.resolve(process.cwd(), 'openapi.json');

function getTagByPath(apiPath) {
  if (apiPath.startsWith('/api/v1/auth')) return 'Auth';
  if (apiPath.startsWith('/api/v1/sync')) return 'Sync';
  if (apiPath.startsWith('/api/v1/admin')) return 'Admin';
  if (apiPath.startsWith('/api/v1/pois')) return 'POIs';
  if (apiPath.startsWith('/api/v1/tours')) return 'Tours';
  if (apiPath.startsWith('/api/v1/analytics')) return 'Analytics';
  return 'System';
}

function requiresBearer(apiPath) {
  if (apiPath.startsWith('/api/v1/sync')) return true;
  if (apiPath.startsWith('/api/v1/pois')) return true;
  if (apiPath.startsWith('/api/v1/tours')) return true;
  if (apiPath.startsWith('/api/v1/analytics')) return true;

  if (apiPath.startsWith('/api/v1/auth')) {
    return [
      '/api/v1/auth/payment/claim',
      '/api/v1/auth/payment/initiate',
      '/api/v1/auth/logout'
    ].includes(apiPath);
  }

  return false;
}

function requiresAdminKey(apiPath) {
  return apiPath.startsWith('/api/v1/admin');
}

function ensureErrorResponse(operation, statusCode, description) {
  operation.responses = operation.responses || {};
  if (!operation.responses[statusCode]) {
    operation.responses[statusCode] = {
      description,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    };
  }
}

function main() {
  if (!fs.existsSync(OPENAPI_PATH)) {
    console.error('openapi.json not found. Run: npm run openapi:generate');
    process.exit(1);
  }

  const doc = JSON.parse(fs.readFileSync(OPENAPI_PATH, 'utf8'));

  delete doc.paths['/api-docs/swagger.json'];

  doc.tags = [
    { name: 'Auth' },
    { name: 'Sync' },
    { name: 'POIs' },
    { name: 'Tours' },
    { name: 'Analytics' },
    { name: 'Admin' },
    { name: 'System' }
  ];

  doc.components = doc.components || {};
  doc.components.schemas = doc.components.schemas || {};
  doc.components.schemas.ErrorResponse = {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'error' },
      error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' }
        }
      }
    }
  };

  for (const [apiPath, pathItem] of Object.entries(doc.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (typeof operation !== 'object' || !operation) {
        continue;
      }

      operation.tags = [getTagByPath(apiPath)];

      if (requiresAdminKey(apiPath)) {
        operation.security = [{ adminApiKey: [] }];
        ensureErrorResponse(operation, '403', 'Forbidden');
      } else if (requiresBearer(apiPath)) {
        operation.security = [{ bearerAuth: [] }];
        ensureErrorResponse(operation, '401', 'Unauthorized');
      } else {
        operation.security = [];
      }

      if (apiPath !== '/') {
        ensureErrorResponse(operation, '500', 'Internal Server Error');
      }

      if (!operation.operationId) {
        const cleanPath = apiPath
          .replace(/^\/+/g, '')
          .replace(/[{}]/g, '')
          .replace(/\//g, '_');
        operation.operationId = `${method}_${cleanPath}`;
      }
    }
  }

  fs.writeFileSync(OPENAPI_PATH, JSON.stringify(doc, null, 2));
  console.log('OpenAPI postprocess completed');
}

main();
