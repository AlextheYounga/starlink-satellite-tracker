<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use App\Models\Satellite;

class SatelliteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
		$model = new Satellite();
		$data = [];
		if (Storage::disk('public')->exists('starlink-spacedata.json')) {
			$data = Storage::disk('public')->get('starlink-spacedata.json');
		} else {
			// Use example data if cron data does not exist.
			$data = Storage::disk('public')->get('starlink-spacedata.example.json');
		}

        $satellites = json_decode($data, true);
		
		foreach ($satellites as $satellite) {
			$satellite = array_change_key_case($satellite, CASE_LOWER);
			$primaryFields = collect($satellite)->only($model->getFillable());
			$metadata = collect($satellite)->except($model->getFillable());
			$satFields = $primaryFields->merge(['metadata' => $metadata]);

			Satellite::updateOrCreate([
				'norad_cat_id' => $satellite['norad_cat_id'],	
			], $satFields->toArray());
		}
    }
}
