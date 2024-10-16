<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class SpaceTrackController extends Controller
{
	protected $attempts;
	protected $timer;
	protected $urls = [
		"auth" => "https://www.space-track.org/ajaxauth/login",
		"spacedata" => "https://www.space-track.org/basicspacedata/query/class/gp/OBJECT_NAME/~~STARLINK/orderby/NORAD_CAT_ID/format/json",
	];

	public function __construct() {
		$this->attempts = 0;
		$this->timer = 1;
	}

	public function authenticate() {
		// Send as a form-data request
		$response = Http::asForm()->post($this->urls['auth'], [
			'identity' => env('SPACE_TRACK_ID'),
			'password' => env('SPACE_TRACK_PASSWORD'),
		]);
		
		$cookieJar = $response->cookies();
		
		if ($response->successful()) {
			echo "Login successful!";
			Storage::put('cookie.txt', $cookieJar);
			sleep(1); // Let's give em a break.
		} else {
			echo "Login failed: " . $response->body();
		}
	}

    public function fetchStarlinkSpaceData() {
		if ($this->attempts > 3) {
			throw new \Exception("Failed to fetch from space-track after 3 attempts");
		}

		if (!Storage::exists('cookie.txt')) {
			$this->authenticate();
		}
		
		$cookieJar = Storage::disk('public')->get('cookie.txt');
		$cookieJar = unserialize($cookieJar);

		try {
			$response = Http::withCookies($cookieJar)->get($this->urls['spacedata']);
			Storage::put('starlink-spacedata.json', $response->body()); // Save the space data to a file in case
			return $response->body();
		} catch (\Illuminate\Http\Client\RequestException $e) {
			if ($e->response->status() === 401) {
				sleep($this->timer);
				$this->timer *= 2; // Exponential backoff
				$this->authenticate();
				$this->fetchStarlinkSpaceData();
			} else {
				throw $e;
			}
		}
	}
}
