# Starlink Satellite Tracker

**Built with**
<p><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="150" alt="Laravel Logo"></a></p>

<img src="./public/images/starlink-satellite-tracker.jpg" width="500" alt="Starlink Satellite Tracker">

This pulls satellite data from [SpaceTrack.org](https://www.space-track.org/)

### Quick Start
If you don't want to install php, I've included a Docker compose file that will download php, composer, then automatically start the dev server. 

`docker compose up`

Then all you'll need to do is run either:

`npm run dev`

 or if you like yarn:

`yarn run dev`

## Normal Laravel Flow 
Install packages (*I like yarn*)\
`yarn` or `npm install`

Install php packages via [composer](https://getcomposer.org/download/)\
`composer install`

Run the db migrations:\
`php artisan migrate`

Run the db seeder to seed the default satellite positions
`php artisan db:seed`

Start the php server\
`php artisan serve`

Start the Vite dev server\
`yarn run dev`
