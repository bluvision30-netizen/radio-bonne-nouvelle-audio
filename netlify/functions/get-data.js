const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  const dataType = event.queryStringParameters?.type || 'programs';
  
  try {
    // Chemin vers les fichiers JSON dans public/data/
    const dataPath = path.join(process.cwd(), 'public', 'data', `${dataType}.json`);
    
    console.log('📁 Recherche du fichier:', dataPath);
    
    if (!fs.existsSync(dataPath)) {
      // Si le fichier n'existe pas, retourner un objet vide
      return {
        statusCode: 200,
        body: JSON.stringify({ [dataType]: [] })
      };
    }
    
    const data = fs.readFileSync(dataPath, 'utf8');
    console.log('✅ Fichier trouvé, contenu:', data.substring(0, 100));
    
    return {
      statusCode: 200,
      body: data
    };
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Erreur de lecture', 
        details: error.message 
      })
    };
  }
};