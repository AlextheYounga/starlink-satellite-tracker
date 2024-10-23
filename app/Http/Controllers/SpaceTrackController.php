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
		
		$netScapeCookie = $response->getHeader('Set-Cookie');
		$cookieJson = json_encode(($response->cookies()->toArray())); 
		
		if ($response->successful()) {
			echo "Login successful!";
			Storage::disk('public')->put('cookie.txt', $netScapeCookie[0]);
			Storage::disk('public')->put('cookie.json', $cookieJson);
			sleep(1); // Let's give em a break.
		} else {
			echo "Login failed: " . $response->body();
		}
	}

    public function fetchStarlinkSpaceData() {
		if ($this->attempts > 3) {
			throw new \Exception("Failed to fetch from space-track after 3 attempts");
		}

		if (!Storage::disk('public')->exists('cookie.txt')) {
			$this->authenticate();
		}
		
		$cookieJson = Storage::disk('public')->get('cookie.json');
		$cookieJson = json_decode($cookieJson, true);
		if ($cookieJson[0]['Expires'] < time()) {
			$this->authenticate();
		}
		$cookieString = Storage::disk('public')->get('cookie.txt');
		
		$response = Http::withHeaders([
			'Cookie' => $cookieString,
		])->get($this->urls['spacedata']);

		if ($response->failed() || array_key_exists('error', json_decode($response->body(), true))) {
			throw new \Exception("Failed to fetch data from space-track: " . $response->body());
		} else {
			Storage::disk('public')->put('starlink-spacedata.json', $response->body());// Save the space data to a file in case
		}
	}
}
