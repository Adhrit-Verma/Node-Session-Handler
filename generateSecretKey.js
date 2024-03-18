const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Function to generate a random secret key
function generateSecretKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Function to create a new secret key record
function createSecretKeyRecord(purpose) {
  const key = generateSecretKey();
  const creationDate = new Date().toISOString();

  const record = {
    purpose: purpose,
    key: key,
    creationDate: creationDate
  };

  // Write the record to a JSON file
  const recordsFilePath = path.join(__dirname, 'secret_key_records.json');
  let records = [];
  if (fs.existsSync(recordsFilePath)) {
    const existingRecords = fs.readFileSync(recordsFilePath);
    records = JSON.parse(existingRecords);
  }
  records.push(record);
  fs.writeFileSync(recordsFilePath, JSON.stringify(records, null, 2));

  console.log('New secret key record created:');
  console.log(record);

  return record;
}

module.exports = {
  generateSecretKey,
  createSecretKeyRecord
};
