<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Satellite;

class SatelliteController extends Controller
{
    public function index()
	{
		$satellites = Satellite::all()
			->only([
				'norad_cat_id',
				'object_name',
				'epoch',
				'mean_motion',
				'inclination',
				'ra_of_asc_node',
				'arg_of_pericenter',
				'mean_anomaly',
				'eccentricity',
			]);
			
		return response()->json($satellites);
	}
}
