module.exports = {
  expo: {
    ...(require('./app.json').expo),
    web: {
      ...((require('./app.json').expo || {}).web || {}),
      meta: {
        viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'black-translucent',
        'mobile-web-app-capable': 'yes',
        'theme-color': '#D4A574',
      },
    },
  },
};
