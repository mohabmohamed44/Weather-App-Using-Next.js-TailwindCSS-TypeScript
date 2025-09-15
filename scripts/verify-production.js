#!/usr/bin/env node
/** @format */

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🚀 Weather App Production Verification\n');

let allChecks = [];
let hasErrors = false;

function addCheck(name, status, message = '') {
  allChecks.push({ name, status, message });
  const icon = status === 'pass' ? '✅' : status === 'warn' ? '⚠️' : '❌';
  console.log(`${icon} ${name}${message ? ': ' + message : ''}`);
  if (status === 'fail') hasErrors = true;
}

// Check 1: Environment file exists
console.log('📋 Checking Environment Configuration...\n');

const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  addCheck('Environment file exists', 'pass');

  // Read and check environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasApiKey = envContent.includes('NEXT_PUBLIC_WEATHER_API_KEY');
  const apiKeyMatch = envContent.match(/NEXT_PUBLIC_WEATHER_API_KEY=([^\s\n]+)/);

  if (hasApiKey && apiKeyMatch && apiKeyMatch[1]) {
    const apiKey = apiKeyMatch[1];
    if (apiKey.length > 20) {
      addCheck('API key format', 'pass', `${apiKey.length} characters`);
    } else {
      addCheck('API key format', 'warn', 'Key seems short - verify it\'s correct');
    }
  } else {
    addCheck('API key configuration', 'fail', 'NEXT_PUBLIC_WEATHER_API_KEY not found or empty');
  }
} else {
  addCheck('Environment file exists', 'fail', '.env.local file not found');
}

// Check 2: Package.json and dependencies
console.log('\n📦 Checking Dependencies...\n');

const packagePath = path.join(__dirname, '../package.json');
if (fs.existsSync(packagePath)) {
  addCheck('Package.json exists', 'pass');

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Check required dependencies
  const requiredDeps = [
    'next',
    'react',
    'axios',
    'react-query',
    'jotai',
    'date-fns',
    'tailwindcss'
  ];

  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      addCheck(`Dependency: ${dep}`, 'pass', dependencies[dep]);
    } else {
      addCheck(`Dependency: ${dep}`, 'warn', 'not found - may cause issues');
    }
  });
} else {
  addCheck('Package.json exists', 'fail', 'package.json not found');
}

// Check 3: Next.js configuration
console.log('\n⚙️ Checking Next.js Configuration...\n');

const nextConfigPath = path.join(__dirname, '../next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  addCheck('Next.js config exists', 'pass');

  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  if (configContent.includes('weatherapi.com') || configContent.includes('cdn.weatherapi.com')) {
    addCheck('WeatherAPI image domains', 'pass', 'configured for weather icons');
  } else {
    addCheck('WeatherAPI image domains', 'warn', 'may need to add weatherapi.com domains');
  }
} else {
  addCheck('Next.js config exists', 'warn', 'using default configuration');
}

// Check 4: Source files structure
console.log('\n📁 Checking File Structure...\n');

const criticalPaths = [
  'src/app/page.tsx',
  'src/components/navbar.tsx',
  'src/components/WeatherDetails.tsx',
  'src/components/WeatherIcon.tsx',
  'src/app/atom.ts'
];

criticalPaths.forEach(filePath => {
  const fullPath = path.join(__dirname, '../', filePath);
  if (fs.existsSync(fullPath)) {
    addCheck(`Source file: ${filePath}`, 'pass');
  } else {
    addCheck(`Source file: ${filePath}`, 'fail', 'required file missing');
  }
});

// Check 5: API endpoints in source files
console.log('\n🌐 Checking API Endpoints...\n');

const sourceFiles = [
  'src/app/page.tsx',
  'src/components/navbar.tsx',
  'src/components/WeatherAPITest.tsx',
  'src/components/APIKeyTester.tsx',
  'src/app/api-test/page.tsx'
];

let httpEndpoints = 0;
let httpsEndpoints = 0;

sourceFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '../', filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');

    const httpMatches = content.match(/http:\/\/api\.weatherapi\.com/g);
    const httpsMatches = content.match(/https:\/\/api\.weatherapi\.com/g);

    if (httpMatches) httpEndpoints += httpMatches.length;
    if (httpsMatches) httpsEndpoints += httpsMatches.length;
  }
});

if (httpEndpoints === 0 && httpsEndpoints > 0) {
  addCheck('API endpoints use HTTPS', 'pass', `${httpsEndpoints} HTTPS endpoints found`);
} else if (httpEndpoints > 0) {
  addCheck('API endpoints use HTTPS', 'fail', `${httpEndpoints} HTTP endpoints found - will cause production errors`);
} else {
  addCheck('API endpoints detected', 'warn', 'no WeatherAPI endpoints found');
}

// Check 6: TypeScript configuration
console.log('\n📝 Checking TypeScript Configuration...\n');

const tsconfigPath = path.join(__dirname, '../tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  addCheck('TypeScript config exists', 'pass');

  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  if (tsconfig.compilerOptions && tsconfig.compilerOptions.strict) {
    addCheck('TypeScript strict mode', 'pass', 'enabled for better code quality');
  } else {
    addCheck('TypeScript strict mode', 'warn', 'consider enabling strict mode');
  }
} else {
  addCheck('TypeScript config exists', 'warn', 'using default configuration');
}

// Check 7: Test API connection (if API key is available)
console.log('\n🔍 Testing API Connection...\n');

const testApiConnection = () => {
  return new Promise((resolve) => {
    const envPath = path.join(__dirname, '../.env.local');
    if (!fs.existsSync(envPath)) {
      resolve({ success: false, message: 'No .env.local file found' });
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const apiKeyMatch = envContent.match(/NEXT_PUBLIC_WEATHER_API_KEY=([^\s\n]+)/);

    if (!apiKeyMatch || !apiKeyMatch[1]) {
      resolve({ success: false, message: 'No API key found' });
      return;
    }

    const apiKey = apiKeyMatch[1];
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=London&aqi=no`;

    const req = https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200 && response.current) {
            resolve({
              success: true,
              message: `${response.location.name}: ${response.current.temp_c}°C`
            });
          } else if (res.statusCode === 401) {
            resolve({ success: false, message: 'Invalid API key (401)' });
          } else {
            resolve({ success: false, message: `HTTP ${res.statusCode}` });
          }
        } catch (error) {
          resolve({ success: false, message: 'Invalid response format' });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, message: error.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ success: false, message: 'Request timeout' });
    });
  });
};

// Run async API test
testApiConnection().then((result) => {
  if (result.success) {
    addCheck('WeatherAPI connection', 'pass', result.message);
  } else {
    addCheck('WeatherAPI connection', 'fail', result.message);
  }

  // Final summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(50) + '\n');

  const passed = allChecks.filter(check => check.status === 'pass').length;
  const warnings = allChecks.filter(check => check.status === 'warn').length;
  const failed = allChecks.filter(check => check.status === 'fail').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📋 Total Checks: ${allChecks.length}\n`);

  if (hasErrors) {
    console.log('🚨 PRODUCTION NOT READY');
    console.log('Please fix the failed checks before deploying to production.\n');

    console.log('💡 Quick Fixes:');
    console.log('1. Ensure NEXT_PUBLIC_WEATHER_API_KEY is set in .env.local');
    console.log('2. Change all http:// to https:// in API calls');
    console.log('3. Verify your WeatherAPI.com account is active');
    console.log('4. Set environment variables in Vercel dashboard\n');

    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️  READY WITH WARNINGS');
    console.log('The app should work but consider addressing warnings for optimal performance.\n');
    process.exit(0);
  } else {
    console.log('🎉 PRODUCTION READY!');
    console.log('All checks passed. Your weather app is ready for deployment.\n');

    console.log('🚀 Next Steps:');
    console.log('1. Push your code to your repository');
    console.log('2. Set NEXT_PUBLIC_WEATHER_API_KEY in Vercel environment variables');
    console.log('3. Deploy to production');
    console.log('4. Test the deployed application\n');

    process.exit(0);
  }
});
