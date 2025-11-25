const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  console.log('🚀 Début create-program avec upload');
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    console.log('📦 Données reçues:', Object.keys(data));
    
    let audioUrl = data.audio_url;
    let imageUrl = data.image_url;

    // 1. UPLOAD AUDIO VERS GITHUB SI FICHIER PRÉSENT
    if (data.audio_file && data.audio_file.name && data.audio_file.data) {
      console.log('🎵 Upload audio vers GitHub...');
      
      const uploadResponse = await fetch(`${process.env.URL || 'https://' + process.env.SITE_NAME + '.netlify.app'}/.netlify/functions/upload-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: data.audio_file.data,
          fileName: data.audio_file.name,
          commitMessage: `🎵 Nouvelle emission: ${data.title}`
        })
      });
      
      const uploadResult = await uploadResponse.json();
      console.log('📡 Résultat upload audio:', uploadResult);
      
      if (uploadResult.success) {
        audioUrl = uploadResult.audio_url;
        console.log('✅ Audio uploadé:', audioUrl);
      } else {
        throw new Error(`Upload audio échoué: ${uploadResult.details}`);
      }
    }

    // 2. UPLOAD IMAGE VERS CLOUDINARY SI FICHIER PRÉSENT
    if (data.image_file && data.image_file.name && data.image_file.data) {
      console.log('🖼️ Upload image vers Cloudinary...');
      
      const imageResponse = await fetch(`${process.env.URL || 'https://' + process.env.SITE_NAME + '.netlify.app'}/.netlify/functions/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: data.image_file.data,
          fileName: data.image_file.name
        })
      });
      
      const imageResult = await imageResponse.json();
      console.log('📡 Résultat upload image:', imageResult);
      
      if (imageResult.success) {
        imageUrl = imageResult.image_url;
        console.log('✅ Image uploadée:', imageUrl);
      } else {
        console.warn('⚠️ Upload image échoué, utilisation URL par défaut');
      }
    }

    // 3. SAUVEGARDER DANS PROGRAMS.JSON
    const programsPath = path.join(process.cwd(), 'public', 'data', 'programs.json');
    console.log('📁 Chemin programs.json:', programsPath);
    
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
      image_url: imageUrl || "https://res.cloudinary.com/demo/image/upload/v1633452348/sample.jpg",
      date: new Date().toISOString().split('T')[0],
      published: true,
      type: 'recorded'
    };
    
    console.log('🎵 Nouveau programme créé:', newProgram);
    
    programsData.programs.unshift(newProgram);
    fs.writeFileSync(programsPath, JSON.stringify(programsData, null, 2));
    console.log('💾 Fichier sauvegardé');
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Émission publiée avec succès!',
        program: newProgram,
        audio_uploaded: !!data.audio_file,
        image_uploaded: !!data.image_file
      })
    };
    
  } catch (error) {
    console.error('💥 Erreur create-program:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Erreur création programme',
        details: error.message,
        step: 'create-program'
      })
    };
  }
};