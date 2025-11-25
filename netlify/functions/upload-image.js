const cloudinary = require('cloudinary').v2;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { imageData, fileName } = JSON.parse(event.body);
    
    // Configuration Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Upload vers Cloudinary
    const result = await cloudinary.uploader.upload(imageData, {
      folder: 'radio-bonne-nouvelle',
      public_id: fileName.replace(/\.[^/.]+$/, ""), // Enlever l'extension
      resource_type: 'image'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        image_url: result.secure_url,
        public_id: result.public_id
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Upload image échoué', 
        details: error.message 
      })
    };
  }
};