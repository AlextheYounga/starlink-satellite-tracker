<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Satellite;

class EarthController extends Controller
{
	public function earth()
	{
		$satellites = Satellite::select([
				'norad_cat_id',
				'object_name',
				'epoch',
				'mean_motion',
				'inclination',
				'ra_of_asc_node',
				'arg_of_pericenter',
				'mean_anomaly',
				'eccentricity',
				'semimajor_axis',
				'tle_line1',
				'tle_line2',
				'tle_line3',
			])->get();

        return Inertia::render('Earth', [
			'satellites' => fn() => $satellites	
		]);
	}
}
