const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Si un fichier audio est inclus, l'uploader d'abord
    let audioUrl = data.audio_url;
    
    if (data.audio_file && data.audio_file.name) {
      const uploadResponse = await fetch(`${process.env.URL}/.netlify/functions/upload-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: data.audio_file.data,
          fileName: data.audio_file.name,
          commitMessage: `Nouvelle emission: ${data.title}`
        })
      });
      
      const uploadResult = await uploadResponse.json();
      if (uploadResult.success) {
        audioUrl = uploadResult.audio_url;
      }
    }
    
    // Lire et mettre à jour programs.json
    const programsPath = path.join(process.cwd(), 'public', 'data', 'programs.json');
    const programsData = JSON.parse(fs.readFileSync(programsPath, 'utf8'));
    
    const newProgram = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      audio_url: audioUrl,
      duration: data.duration,
      speaker: data.speaker,
      category: data.category,
      image_url: data.image_url,
      date: new Date().toISOString().split('T')[0],
      published: true,
      type: data.type || 'recorded'
    };
    
    programsData.programs.unshift(newProgram);
    fs.writeFileSync(programsPath, JSON.stringify(programsData, null, 2));
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Émission publiée avec succès!',
        program: newProgram
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};