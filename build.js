const fs = require('fs');
const path = require('path');

// Read the template manifest
const templateManifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'manifest.template.json'), 'utf8')
);

// Browser-specific configurations
const browserConfigs = {
    chrome: {
        manifest_version: 3,
        background: {
            service_worker: 'background.js'
        },
        action: {
            default_icon: {
                "16": "icons/icon-16.png",
                "32": "icons/icon-32.png",
                "48": "icons/icon-48.png",
                "128": "icons/icon-128.png"
            },
            default_title: "Podomoro",
            default_popup: "popup/popup.html"
        }
    },
    firefox: {
        manifest_version: 2,
        background: {
            scripts: ['background.js']
        },
        browser_action: {
            default_icon: {
                "16": "icons/icon-16.png",
                "32": "icons/icon-32.png",
                "48": "icons/icon-48.png",
                "64": "icons/icon-64.png"
            },
            default_title: "Podomoro",
            default_popup: "popup/popup.html"
        },
        browser_specific_settings: {
            gecko: {
                id: "podomoro@example.com",
                strict_min_version: "57.0"
            }
        }
    }
};

// Generate manifests for each browser
function generateManifest(browser) {
    const config = browserConfigs[browser];
    const manifest = { ...templateManifest, ...config };
    
    const outputPath = path.join(
        __dirname,
        browser === 'firefox' ? 'manifest.json' : `manifest.${browser}.json`
    );
    
    fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
    console.log(`Generated ${browser} manifest at: ${outputPath}`);
}

// Generate for both browsers
generateManifest('chrome');
generateManifest('firefox');
