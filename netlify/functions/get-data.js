const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  const { pathParameters } = event;
  const dataType = event.queryStringParameters?.type || 'programs';

  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', `${dataType}.json`);
    
    if (!fs.existsSync(dataPath)) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Data not found' })
      };
    }
    
    const data = fs.readFileSync(dataPath, 'utf8');
    
    return {
      statusCode: 200,
      body: data
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};