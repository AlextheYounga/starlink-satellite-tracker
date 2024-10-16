<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */

    public function up(): void
    {
        Schema::create('satellites', function (Blueprint $table) {
            $table->id();
			$table->string('norad_cat_id');
			$table->string('object_id');
			$table->string('object_name');
			$table->datetime('epoch')->comment('Timestamp representing the exact time when the satellite’s position and velocity were recorded.');
			$table->string('time_system');
			$table->float('mean_motion')->comment('The number of orbits the satellite completes per day. Higher values indicate faster orbits.');
			$table->float('inclination')->comment('The angle between the satellite’s orbital plane and the Earth\'s equatorial plane. It determines the range of latitudes the satellite passes over.');
			$table->float('ra_of_asc_node')->comment('(Right Ascension of the Ascending Node) The point where the satellite crosses the equatorial plane heading north, measured as an angle.');
			$table->float('arg_of_pericenter')->comment('The angle from the ascending node to the point of closest approach (perigee) in the orbit.');
			$table->float('mean_anomaly')->comment('The satellite\'s position along its orbit at the given epoch time, expressed as an angle.');
			$table->float('eccentricity')->comment('Defines the shape of the orbit. A value of 0 represents a perfect circle, while values closer to 1 indicate an elliptical orbit.');
			$table->float('period')->comment('The time (in minutes) it takes for the satellite to complete one full orbit.');
			$table->float('apoapsis')->comment('The farthest point in the satellite’s orbit from Earth.');
			$table->float('periapsis')->comment('The closest point in the satellite’s orbit to Earth.');
			$table->float('bstar')->comment('A parameter that accounts for atmospheric drag affecting the satellite\'s orbit. Higher values indicate more drag.');
			$table->float('mean_motion_dot')->comment('The rate of change in the satellite’s mean motion, showing how quickly its orbit is evolving over time.');
			$table->float('mean_motion_ddot')->comment('The acceleration of the mean motion, indicating if the rate of change is itself increasing or decreasing.');
			$table->float('semimajor_axis')->comment('Half of the longest diameter of the satellite’s orbit. For near-circular orbits, this value approximates the average distance from the Earth’s center.');
			$table->integer('rev_at_epoch')->comment('The number of complete orbits (revolutions) the satellite has made around the Earth at the specified epoch time.');
			$table->datetime('creation_date')->nullable();
			$table->datetime('launch_date')->nullable();
			$table->datetime('decay_date')->nullable();
			$table->string('tle_line1')->nullable();
			$table->string('tle_line2')->nullable();
			$table->string('tle_line3')->nullable();
			$table->json('metadata');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('satellites');
    }
};
