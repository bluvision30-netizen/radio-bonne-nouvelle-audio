exports.handler = async (event) => {
  console.log('🎵 Upload audio - Version simple');
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: "Upload simulé - Utilisez l'upload manuel pour l'instant",
      instructions: "Allez sur GitHub et uploadez manuellement le fichier"
    })
  };
};
