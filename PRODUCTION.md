# Production Deployment Guide

This guide will help you successfully deploy your Weather App to production and resolve common issues.

## 🚨 Quick Fix for Network Errors

If you're seeing "Network Error" or "ERR_NETWORK" in production, follow these steps:

### 1. Environment Variables Setup in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your weather app project
3. Go to **Settings** → **Environment Variables**
4. Add the following variable:
   - **Key**: `NEXT_PUBLIC_WEATHER_API_KEY`
   - **Value**: `2d1c109a09b84b6f831181931251509`
   - **Environments**: Check all three boxes (Production, Preview, Development)
5. Click **Save**

### 2. Redeploy Your Application

After adding environment variables:
1. Go to the **Deployments** tab
2. Click the three dots (**...**) next to your latest deployment
3. Select **Redeploy**
4. Wait for deployment to complete

## 🔧 Technical Issues & Solutions

### Issue 1: Mixed Content Security Policy
**Problem**: HTTP requests from HTTPS site are blocked by browsers.
**Solution**: All API endpoints now use HTTPS (already fixed in code).

### Issue 2: Environment Variables Not Available
**Problem**: `NEXT_WEATHER_API_KEY` doesn't work in client-side code.
**Solution**: Use `NEXT_PUBLIC_WEATHER_API_KEY` instead (already updated in code).

### Issue 3: Wrong Number of Forecast Days
**Problem**: Some endpoints were requesting 3 days instead of 7.
**Solution**: All endpoints now request 7 days (already fixed in code).

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Environment variable `NEXT_PUBLIC_WEATHER_API_KEY` is set in Vercel
- [ ] All API endpoints use HTTPS (`https://api.weatherapi.com/`)
- [ ] All forecast requests specify `days=7`
- [ ] No console errors in local development
- [ ] API key is valid and active

## 🧪 Testing Your Deployment

### 1. Test Environment Variables
Visit your deployed site and append `/api-test` to the URL:
```
https://your-app.vercel.app/api-test
```

This page will:
- Show if your API key is properly configured
- Test the WeatherAPI.com connection
- Display 7 days of forecast data

### 2. Test Main Features
1. **Search functionality**: Try searching for different cities
2. **Current location**: Test the GPS location feature
3. **7-day forecast**: Verify all 7 days are displayed
4. **Error handling**: Check that errors are displayed properly

## 🐛 Troubleshooting Common Issues

### Network Error (ERR_NETWORK)
**Symptoms**: "AxiosError: Network Error" in browser console
**Causes**:
1. Missing environment variables in Vercel
2. API key is invalid or expired
3. Rate limiting from WeatherAPI.com

**Solutions**:
1. Verify environment variable in Vercel settings
2. Check API key validity at [WeatherAPI.com dashboard](https://www.weatherapi.com/my/)
3. Wait a few minutes if rate limited

### API Key Not Found
**Symptoms**: "Weather API key is missing" error
**Solution**: Ensure `NEXT_PUBLIC_WEATHER_API_KEY` is set in Vercel environment variables

### CORS Errors
**Symptoms**: "Cross-Origin Request Blocked" errors
**Solution**: WeatherAPI.com supports CORS, but ensure you're using HTTPS endpoints

### Invalid Location Errors
**Symptoms**: "Location not found" for valid cities
**Solution**: Check API key permissions and account status

## 🌐 API Endpoints Used

Your app uses these WeatherAPI.com endpoints:

1. **Search Suggestions**:
   ```
   https://api.weatherapi.com/v1/search.json?key=YOUR_KEY&q=CITY
   ```

2. **7-Day Forecast**:
   ```
   https://api.weatherapi.com/v1/forecast.json?key=YOUR_KEY&q=CITY&days=7&aqi=no&alerts=no
   ```

3. **Current Weather**:
   ```
   https://api.weatherapi.com/v1/current.json?key=YOUR_KEY&q=CITY&aqi=no
   ```

## 📊 Performance Tips

1. **Caching**: Implement API response caching to reduce API calls
2. **Error Boundaries**: Add React error boundaries for better error handling
3. **Loading States**: Ensure all components have proper loading indicators
4. **Rate Limiting**: Implement request throttling for search suggestions

## 🔒 Security Best Practices

1. **API Key**: Keep your API key secure (already using NEXT_PUBLIC_ prefix correctly)
2. **HTTPS**: Always use HTTPS endpoints (already implemented)
3. **Input Validation**: Validate user inputs before API calls
4. **Error Messages**: Don't expose sensitive information in error messages

## 📞 Support & Resources

- **WeatherAPI.com Documentation**: https://www.weatherapi.com/docs/
- **WeatherAPI.com Dashboard**: https://www.weatherapi.com/my/
- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Environment Variables**: https://nextjs.org/docs/basic-features/environment-variables

## 🎯 Success Verification

Your deployment is successful when:
- [ ] Main page loads without errors
- [ ] City search returns suggestions
- [ ] Current location works
- [ ] 7-day forecast displays correctly
- [ ] No network errors in browser console
- [ ] API test page shows "API is working"

## 🚀 Post-Deployment

After successful deployment:
1. Test all features thoroughly
2. Monitor API usage in WeatherAPI.com dashboard
3. Set up error tracking (optional)
4. Consider implementing analytics (optional)

---

**Last Updated**: December 2024
**API Version**: WeatherAPI.com v1
**Framework**: Next.js with TypeScript