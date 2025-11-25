const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const livePath = path.join(process.cwd(), 'public', 'data', 'live.json');
    
    const liveData = {
      is_live: data.is_live,
      facebook_url: data.facebook_url || '',
      title: data.title || 'Émission en Direct',
      description: data.description || 'Rejoignez-nous en direct',
      updated_at: new Date().toISOString()
    };
    
    fs.writeFileSync(livePath, JSON.stringify(liveData, null, 2));
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Statut live mis à jour!',
        data: liveData
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};