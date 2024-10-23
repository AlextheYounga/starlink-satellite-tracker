<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\SpaceTrackController;
use Database\Seeders\SatelliteSeeder;

class SpaceTrack extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:spacetrack';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Pull latest satellite data from SpaceTrack.org';

    /**
     * Execute the console command.
     */
    public function handle()
    {
		$controller = new SpaceTrackController();
		$controller->fetchStarlinkSpaceData();
		$this->call(SatelliteSeeder::class);
    }
}
