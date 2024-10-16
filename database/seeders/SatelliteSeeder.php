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
		$storage = Storage::disk('public')->get('starlink-spacedata.json');
        $satellites = json_decode($storage, true);
		
		foreach ($satellites as $satellite) {
			$satellite = array_change_key_case($satellite, CASE_LOWER);
			$primaryFields = collect($satellite)->only($model->getFillable());
			$metadata = collect($satellite)->except($model->getFillable());
			$satFields = $primaryFields->merge(['metadata' => $metadata]);

			$satRecord = Satellite::updateOrCreate([
				'norad_cat_id' => $satellite['norad_cat_id'],	
			], $satFields->toArray());

			print_r("Seeding " . $satRecord->id . "\n");
		}
    }
}
