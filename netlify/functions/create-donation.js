const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const donationsPath = path.join(process.cwd(), 'public', 'data', 'donations.json');
    
    // Lire les dons existants
    let donationsData = { donations: [] };
    try {
      donationsData = JSON.parse(fs.readFileSync(donationsPath, 'utf8'));
    } catch (e) {
      // Fichier n'existe pas encore
    }
    
    const newDonation = {
      id: Date.now().toString(),
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      amount: parseInt(data.amount),
      method: data.method,
      message: data.message || '',
      date: new Date().toISOString(),
      status: 'pending'
    };
    
    donationsData.donations.unshift(newDonation);
    
    // Sauvegarder
    fs.writeFileSync(donationsPath, JSON.stringify(donationsData, null, 2));
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Don enregistré!',
        donation: newDonation
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};