const { Octokit } = require('@octokit/rest');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { audioData, fileName, commitMessage } = JSON.parse(event.body);
    
    // Configuration GitHub
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    const [owner, repo] = process.env.GITHUB_REPO.split('/');
    
    // Upload vers GitHub
    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `emissions/${fileName}`,
      message: commitMessage || `Ajout emission: ${fileName}`,
      content: audioData, // Base64
      branch: 'main'
    });

    // Générer le lien RAW
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/emissions/${fileName}`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        audio_url: rawUrl,
        download_url: response.data.content.download_url
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Upload failed', 
        details: error.message 
      })
    };
  }
};