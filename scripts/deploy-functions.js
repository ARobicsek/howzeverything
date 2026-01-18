#!/usr/bin/env node

/**
 * Edge Function Deployment Script
 * Deploys Supabase Edge Functions using the Management API
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration
const SUPABASE_PROJECT_REF = 'cjznbkcurzotvusorjec';
const SUPABASE_URL = 'https://cjznbkcurzotvusorjec.supabase.co';

// You'll need to get this from: https://supabase.com/dashboard/account/tokens
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ SUPABASE_ACCESS_TOKEN environment variable is required');
  console.log('📋 Get your access token from: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

// Function configurations
const FUNCTIONS = [
  {
    name: 'dish-search',
    path: join(__dirname, 'supabase', 'functions', 'dish-search', 'index.ts')
  },
  {
    name: 'get-menu-data',
    path: join(__dirname, 'supabase', 'functions', 'get-menu-data', 'index.ts')
  },
  {
    name: 'geoapify-proxy',
    path: join(__dirname, 'supabase', 'functions', 'geoapify-proxy', 'index.ts')
  }
];

async function deployFunction(functionName, functionCode) {
  const url = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/functions/${functionName}`;
  
  console.log(`🚀 Deploying function: ${functionName}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        slug: functionName,
        source: functionCode,
        verify_jwt: false // We handle JWT verification in the function itself
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log(`✅ Successfully deployed: ${functionName}`);
    return result;

  } catch (error) {
    console.error(`❌ Failed to deploy ${functionName}:`, error.message);
    throw error;
  }
}

async function deployAllFunctions() {
  console.log('🔄 Starting edge function deployment...\n');

  for (const func of FUNCTIONS) {
    try {
      console.log(`📖 Reading function: ${func.name}`);
      const functionCode = readFileSync(func.path, 'utf8');
      
      await deployFunction(func.name, functionCode);
      console.log(`✅ ${func.name} deployed successfully\n`);
      
      // Small delay between deployments
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to deploy ${func.name}:`, error.message);
      console.log('🛑 Stopping deployment due to error\n');
      process.exit(1);
    }
  }

  console.log('🎉 All edge functions deployed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Test the functions in your browser');
  console.log('2. Check the Supabase dashboard for function logs');
  console.log('3. Verify CORS errors are resolved');
}

// Also provide a browser-based deployment option
function generateBrowserDeploymentCode() {
  const browserCode = `
// Browser-based deployment script
// Run this in your browser's developer console on the Supabase dashboard

const SUPABASE_ACCESS_TOKEN = 'YOUR_TOKEN_HERE'; // Get from https://supabase.com/dashboard/account/tokens
const PROJECT_REF = '${SUPABASE_PROJECT_REF}';

// Function codes (you'll need to copy these from your files)
const FUNCTIONS = {
  'dish-search': \`${readFileSync(FUNCTIONS[0].path, 'utf8').replace(/`/g, '\\`')}\`,
  'get-menu-data': \`${readFileSync(FUNCTIONS[1].path, 'utf8').replace(/`/g, '\\`')}\`,
  'geoapify-proxy': \`${readFileSync(FUNCTIONS[2].path, 'utf8').replace(/`/g, '\\`')}\`
};

async function deployFunction(name, code) {
  const response = await fetch(\`https://api.supabase.com/v1/projects/\${PROJECT_REF}/functions/\${name}\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${SUPABASE_ACCESS_TOKEN}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      slug: name,
      source: code,
      verify_jwt: false
    })
  });
  
  if (!response.ok) {
    throw new Error(\`Failed to deploy \${name}: \${await response.text()}\`);
  }
  
  console.log(\`✅ Deployed: \${name}\`);
  return await response.json();
}

// Deploy all functions
(async () => {
  for (const [name, code] of Object.entries(FUNCTIONS)) {
    try {
      await deployFunction(name, code);
    } catch (error) {
      console.error('Deployment failed:', error);
      break;
    }
  }
  console.log('🎉 All functions deployed!');
})();
`;

  // Write browser deployment script
  const browserScriptPath = join(__dirname, 'browser-deploy.js');
  require('fs').writeFileSync(browserScriptPath, browserCode);
  
  console.log(`📝 Browser deployment script created: ${browserScriptPath}`);
  console.log('\n🌐 To use browser deployment:');
  console.log('1. Get your access token from: https://supabase.com/dashboard/account/tokens');
  console.log('2. Open browser-deploy.js and replace YOUR_TOKEN_HERE with your token');
  console.log('3. Copy the entire script and run it in your browser console');
}

// Main execution
if (process.argv.includes('--browser')) {
  generateBrowserDeploymentCode();
} else {
  deployAllFunctions().catch(error => {
    console.error('💥 Deployment failed:', error);
    process.exit(1);
  });
}