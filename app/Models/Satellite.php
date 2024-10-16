<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Satellite extends Model
{
    use HasFactory;

	protected $table = 'satellites';

	public $fillable = [
		'norad_cat_id',
		'object_id',
		'object_name',
		'epoch',
		'time_system',
		'mean_motion',
		'inclination',
		'ra_of_asc_node',
		'arg_of_pericenter',
		'mean_anomaly',
		'eccentricity',
		'period',
		'apoapsis',
		'periapsis',
		'bstar',
		'mean_motion_dot',
		'mean_motion_ddot',
		'semimajor_axis',
		'rev_at_epoch',
		'creation_date',
		'launch_date',
		'decay_date',
		'tle_line1',
		'tle_line2',
		'tle_line3',
		'metadata',
	];

	protected $casts = [
		'epoch' => 'datetime',
		'launch_date' => 'datetime',
		'creation_date' => 'datetime',
		'decay_date' => 'datetime',
		'metadata' => 'json',
	];
}
