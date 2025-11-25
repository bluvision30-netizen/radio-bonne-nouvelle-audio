const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Chemin vers donations.json
    const donationsPath = path.join(process.cwd(), 'public', 'data', 'donations.json');
    
    // Lire ou créer le fichier
    let donationsData = { donations: [] };
    if (fs.existsSync(donationsPath)) {
      donationsData = JSON.parse(fs.readFileSync(donationsPath, 'utf8'));
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