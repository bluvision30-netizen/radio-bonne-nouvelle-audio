exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { audioData, fileName, commitMessage } = JSON.parse(event.body);
    
    const [owner, repo] = process.env.GITHUB_REPO.split('/');
    const token = process.env.GITHUB_TOKEN;

    // Upload direct vers GitHub sans octokit
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/emissions/${fileName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: commitMessage || `Ajout emission: ${fileName}`,
        content: audioData, // Base64 sans le prefix
        branch: 'main'
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Upload failed');
    }

    // Générer le lien RAW
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/emissions/${fileName}`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        audio_url: rawUrl,
        download_url: result.content.download_url
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Upload échoué', 
        details: error.message 
      })
    };
  }
};
