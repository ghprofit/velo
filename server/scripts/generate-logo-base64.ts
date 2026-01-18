import { readFileSync } from 'fs';
import { join } from 'path';

const generateBase64Logo = () => {
  try {
    // Read the PNG logo file
    const logoPath = join(__dirname, '..', 'assets', 'logo_pngs', 'Secondary_Logo_white.png');
    const fileBuffer = readFileSync(logoPath);
    
    // Convert to base64
    const base64 = fileBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64}`;
    
    console.log('✅ Logo converted to base64');
    console.log(`📏 Size: ${fileBuffer.length} bytes`);
    console.log(`📏 Base64 length: ${base64.length} characters`);
    console.log('\n📋 Copy this data URI:\n');
    console.log(dataUri);
    
    return dataUri;
  } catch (error) {
    console.error('❌ Error generating base64:', error);
    process.exit(1);
  }
};

generateBase64Logo();
