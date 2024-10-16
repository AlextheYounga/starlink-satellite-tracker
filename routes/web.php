<?php

use App\Http\Controllers\EarthController;
use Illuminate\Support\Facades\Route;

// Pages
Route::get('/', [EarthController::class, 'earth'])->name('earth');