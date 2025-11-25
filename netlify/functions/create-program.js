const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  console.log('🚀 Début create-program - Debug mode');
  console.log('📨 Méthode HTTP:', event.httpMethod);
  console.log('📦 Body reçu:', event.body ? 'PRÉSENT' : 'ABSENT');
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // VÉRIFIER SI LE BODY EST VIDE
    if (!event.body) {
      console.log('❌ Body vide');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Body vide' })
      };
    }

    let data;
    try {
      data = JSON.parse(event.body);
      console.log('✅ JSON parsé avec succès');
      console.log('📊 Clés des données:', Object.keys(data));
    } catch (parseError) {
      console.log('❌ Erreur parsing JSON:', parseError.message);
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'JSON invalide',
          details: parseError.message 
        })
      };
    }

    // VÉRIFIER LES DONNÉES OBLIGATOIRES
    if (!data.title || !data.description || !data.duration || !data.speaker || !data.category) {
      console.log('❌ Données manquantes:', {
        title: !!data.title,
        description: !!data.description,
        duration: !!data.duration,
        speaker: !!data.speaker,
        category: !!data.category
      });
      
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Données manquantes',
          required: ['title', 'description', 'duration', 'speaker', 'category']
        })
      };
    }

    console.log('🎵 Données audio:', {
      hasAudioFile: !!(data.audio_file && data.audio_file.data),
      audioFileSize: data.audio_file?.data?.length || 0
    });

    let audioUrl = "https://raw.githubusercontent.com/tonusername/radio-bonne-nouvelle-audio/main/emissions/default.mp3";

    // ESSAYER L'UPLOAD AUDIO SI PRÉSENT
    if (data.audio_file && data.audio_file.data && data.audio_file.name) {
      try {
        console.log('📤 Tentative upload audio...');
        
        const uploadResponse = await fetch(`https://radio-bonne-nouvelle-audio.netlify.app/.netlify/functions/upload-audio`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            audioData: data.audio_file.data,
            fileName: data.audio_file.name.replace(/\s+/g, '-'), // Remplacer espaces par -
            commitMessage: `🎵 ${data.title}`
          })
        });

        console.log('📡 Statut upload:', uploadResponse.status);
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          console.log('✅ Upload réussi:', uploadResult);
          
          if (uploadResult.success) {
            audioUrl = uploadResult.audio_url;
          }
        } else {
          console.warn('⚠️ Upload échoué, statut:', uploadResponse.status);
        }
      } catch (uploadError) {
        console.warn('⚠️ Erreur upload:', uploadError.message);
      }
    }

    // CRÉER LE PROGRAMME
    const programsPath = path.join(process.cwd(), 'public', 'data', 'programs.json');
    
    let programsData = { programs: [] };
    if (fs.existsSync(programsPath)) {
      programsData = JSON.parse(fs.readFileSync(programsPath, 'utf8'));
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
      type: 'recorded'
    };
    
    console.log('💾 Sauvegarde du programme:', newProgram.title);
    
    programsData.programs.unshift(newProgram);
    fs.writeFileSync(programsPath, JSON.stringify(programsData, null, 2));
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Émission publiée!',
        program: newProgram,
        audio_uploaded: audioUrl !== "https://raw.githubusercontent.com/tonusername/radio-bonne-nouvelle-audio/main/emissions/default.mp3"
      })
    };
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Erreur serveur',
        details: error.message 
      })
    };
  }
};
