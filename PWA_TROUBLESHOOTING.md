# PWA Troubleshooting Guide

## Issue: Install Prompt Not Showing on Chrome macOS

### Common Causes and Solutions

1. **Missing PWA Icons**

   - Chrome requires valid icons in the manifest
   - Create these files in `public/`:
     - `icon-192x192.png` (192x192 pixels)
     - `icon-512x512.png` (512x512 pixels)
   - Use tools like [RealFaviconGenerator](https://realfavicongenerator.net/) or [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

2. **HTTPS Required**

   - PWAs require HTTPS (or localhost)
   - For local development, run: `npm run dev -- --experimental-https`
   - Or use a tool like [ngrok](https://ngrok.com/) for HTTPS tunneling

3. **Service Worker Not Registered**

   - Check browser console for service worker registration errors
   - Open DevTools > Application > Service Workers
   - Ensure `/sw.js` is accessible and returns 200

4. **Manifest Not Accessible**

   - Verify `/manifest.json` is accessible
   - Check DevTools > Application > Manifest
   - Ensure all required fields are present

5. **Chrome Installability Criteria**
   Chrome requires:

   - Valid manifest with `name`, `short_name`, `icons` (at least 192x192 and 512x512)
   - Service worker registered and active
   - Served over HTTPS (or localhost)
   - User engagement (user must interact with the site)

6. **Manual Trigger**
   - Use the "Show Install Dialog" button on the page
   - Or check DevTools console for component state logs
   - Component logs: `isInstallAvailable`, `isUnderStandaloneMode`, `isDialogHidden`

### Debugging Steps

1. **Check Browser Console**

   ```javascript
   // In browser console, check:
   navigator.serviceWorker.controller;
   // Should return a ServiceWorker object if registered

   // Check if install is available
   let deferredPrompt;
   window.addEventListener("beforeinstallprompt", (e) => {
     deferredPrompt = e;
     console.log("Install prompt available");
   });
   ```

2. **Check Manifest**

   - Open DevTools > Application > Manifest
   - Verify all fields are correct
   - Check for any errors

3. **Check Service Worker**

   - Open DevTools > Application > Service Workers
   - Verify service worker is registered and active
   - Check for any errors in the console

4. **Check Network Tab**
   - Ensure `/sw.js` loads successfully
   - Ensure `/manifest.json` loads successfully
   - Check for any CORS or network errors

### Quick Fixes

1. **Clear Browser Data**

   - Clear site data: DevTools > Application > Clear storage
   - Unregister service workers: DevTools > Application > Service Workers > Unregister

2. **Hard Refresh**

   - Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
   - Or disable cache in DevTools Network tab

3. **Test in Incognito**

   - Open incognito/private window
   - Prevents cached data from interfering

4. **Check Chrome Flags**
   - Visit `chrome://flags`
   - Ensure PWA-related flags are enabled (usually enabled by default)

### Testing Checklist

- [ ] Icons exist (`icon-192x192.png` and `icon-512x512.png`)
- [ ] Running over HTTPS or localhost
- [ ] Service worker registered (check console)
- [ ] Manifest accessible at `/manifest.json`
- [ ] Component rendered on page
- [ ] Browser console shows no errors
- [ ] "Show Install Dialog" button works
- [ ] User has interacted with the page

### Still Not Working?

1. Check the browser console for specific errors
2. Verify all files are in the correct locations
3. Try a different browser to isolate the issue
4. Check if the site meets Chrome's installability criteria
5. Ensure you're not already in standalone mode (already installed)
