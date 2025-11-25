const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  console.log('🚀 Début create-program - Version stable');
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    // VÉRIFIER LE BODY
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Body vide' })
      };
    }

    let data;
    try {
      data = JSON.parse(event.body);
      console.log('✅ JSON parsé');
    } catch (parseError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'JSON invalide' })
      };
    }

    // VALIDATION DES DONNÉES
    const required = ['title', 'description', 'duration', 'speaker', 'category'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Champs manquants', 
          missing: missing 
        })
      };
    }

    // GÉNÉRER UN NOM DE FICHIER UNIQUE
    const fileName = `emission-${Date.now()}.mp3`;
    const audioUrl = `https://raw.githubusercontent.com/tonusername/radio-bonne-nouvelle-audio/main/emissions/${fileName}`;

    console.log('🎵 URL audio générée:', audioUrl);

    // SAUVEGARDER DANS JSON
    const programsPath = path.join(process.cwd(), 'public', 'data', 'programs.json');
    
    // CRÉER LE DOSSIER SI IL N'EXISTE PAS
    const dataDir = path.dirname(programsPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    let programsData = { programs: [] };
    if (fs.existsSync(programsPath)) {
      try {
        programsData = JSON.parse(fs.readFileSync(programsPath, 'utf8'));
      } catch (e) {
        console.warn('⚠️ Erreur lecture JSON, création nouveau fichier');
      }
    }
    
    const newProgram = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      audio_url: audioUrl,
      duration: data.duration,
      speaker: data.speaker,
      category: data.category,
      image_url: data.image_url || "https://res.cloudinary.com/demo/image/upload/v1633452348/sample.jpg",
      date: new Date().toISOString().split('T')[0],
      published: true,
      type: 'recorded',
      // INSTRUCTIONS POUR L'UPLOAD MANUEL
      upload_instructions: `📤 Uploadez manuellement le fichier audio vers GitHub: ${fileName}`
    };
    
    console.log('💾 Création programme:', newProgram.title);
    
    programsData.programs.unshift(newProgram);
    
    // SAUVEGARDER
    fs.writeFileSync(programsPath, JSON.stringify(programsData, null, 2));
    console.log('✅ Programme sauvegardé');
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Émission créée! Upload manuel requis.',
        program: newProgram,
        instructions: {
          file_name: fileName,
          github_repo: process.env.GITHUB_REPO,
          steps: [
            "1. Aller sur GitHub",
            "2. Uploader le fichier audio dans le dossier 'emissions'",
            `3. Nom du fichier: ${fileName}`,
            "4. Le site se mettra à jour automatiquement"
          ]
        }
      })
    };
    
  } catch (error) {
    console.error('💥 Erreur create-program:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Erreur interne',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
