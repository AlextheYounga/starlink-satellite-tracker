<?php
use Illuminate\Support\Facades\Schedule;

/* Example of a scheduled command
 use Illuminate\Foundation\Inspiring;
 use Illuminate\Support\Facades\Artisan;
 Artisan::command('inspire', function () {
     $this->comment(Inspiring::quote());
 })->purpose('Display an inspiring quote')->hourly();
 */

 
Schedule::command('app:spacetrack')->daily();
