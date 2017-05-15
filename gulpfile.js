if(process.env.NODE_ENV == 'production') {
  console.log('Loading prod gulpfile.');
  require('./gulp/prod.gulpfile');
} else {
  console.log('Loading dev gulpfile.');
  require('./gulp/dev.gulpfile');
}