exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { audioData, fileName, commitMessage } = JSON.parse(event.body);
    
    const [owner, repo] = process.env.GITHUB_REPO.split('/');
    const token = process.env.GITHUB_TOKEN;

    console.log('📤 Upload vers GitHub:', fileName);
    
    // Upload vers GitHub
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/emissions/${fileName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: commitMessage || `🎵 Ajout emission: ${fileName}`,
        content: audioData, // Base64 sans le prefix
        branch: 'main'
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur GitHub:', result);
      throw new Error(result.message || `GitHub API error: ${response.status}`);
    }

    // Générer le lien RAW
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/emissions/${fileName}`;
    
    console.log('✅ Upload réussi:', rawUrl);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        audio_url: rawUrl,
        download_url: result.content.download_url,
        github_url: result.content.html_url
      })
    };

  } catch (error) {
    console.error('💥 Erreur upload audio:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Upload audio échoué', 
        details: error.message 
      })
    };
  }
};